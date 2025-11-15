import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

import adminRoutes from "./routes/admin";
import authRoutes from "./routes/auth";
import roomRoutes from "./routes/room";
import { setupAdminSocket } from "./socket/adminSocket";
import { handelStart, handelDisconnect, getType } from "./lib";
import { GetTypesResult, room, RoomJoinData } from "./types";
import Ad from "./models/Ad";
import User from "./models/User";
import Room from "./models/Room";

dotenv.config();

const app = express();

// ✅ Allow frontend to call backend (important for Render + Vercel)
const allowedOrigins = [
  "https://tugwemo-frontend.onrender.com",
  "https://tugwemo.vercel.app",
  "https://tugwemo-admin.vercel.app",  //
  "http://localhost:5173",              // dev
  "http://localhost:3000",              // dev (React/Vite)
];

app.options("*", cors({
  origin: [
    "https://tugwemo-frontend.onrender.com",
    "https://tugwemo.vercel.app",
    "https://tugwemo-admin.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true,
}));


app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// ✅ Connect to MongoDB
const mongoUri =
  process.env.MONGO_URI ||
  process.env.DATABASE_URL ||
  "mongodb://localhost:27017/tugwemo";

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ API routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/room", roomRoutes);

// ✅ Serve uploaded files (if needed)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ✅ Simple health check endpoint
app.get("/api/status", (req, res) => {
  res.json({ status: "Server is running fine 🚀" });
});

// ✅ Fallback: no static frontend served (frontend is on Vercel)
app.get("/", (req, res) => {
  res.json({
    message: "Tugwemo Backend API is running. Frontend is hosted separately.",
  });
});

// ✅ Setup HTTP + Socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

// ✅ Socket.io logic
let online = 0;
let roomArr: Array<room> = [];
let customRooms: Map<string, RoomJoinData[]> = new Map(); // roomCode -> participants

// Setup admin socket namespace
setupAdminSocket(io);

io.on("connection", (socket) => {
  online++;
  io.emit("online", online);

  // --- start event
  socket.on("start", (cb) => {
    handelStart(roomArr, socket, cb, io);
  });

  // --- disconnect
  socket.on("disconnect", () => {
    online--;
    io.emit("online", online);
    handelDisconnect(socket.id, roomArr, io);
  });

  // --- next
  socket.on("next", () => {
    handelDisconnect(socket.id, roomArr, io);
    handelStart(roomArr, socket, () => {
      socket.emit("remote-socket", socket.id);
    }, io);
  });

  // --- ICE candidates
  socket.on("ice:send", ({ candidate }) => {
    const type: GetTypesResult = getType(socket.id, roomArr);
    if (!type) return;
    if (type.type === "p1" && type.p2id) io.to(type.p2id).emit("ice:reply", { candidate });
    if (type.type === "p2" && type.p1id) io.to(type.p1id).emit("ice:reply", { candidate });
  });

  // --- SDP offer/answer
  socket.on("sdp:send", ({ sdp }) => {
    const type = getType(socket.id, roomArr);
    if (!type) return;
    if (type.type === "p1" && type.p2id) io.to(type.p2id).emit("sdp:reply", { sdp });
    if (type.type === "p2" && type.p1id) io.to(type.p1id).emit("sdp:reply", { sdp });
  });

  // --- Chat messages
  socket.on("send-message", (input, type, roomid) => {
    const sender = type === "p1" ? "You: " : "Stranger: ";
    socket.to(roomid).emit("get-message", input, sender);
  });

  // --- Custom room events (REQUIRES AUTHENTICATION)
  socket.on("join-custom-room", async (data) => {
    try {
      const { roomCode } = data;
      const token = socket.handshake.auth?.token;

      // REQUIRE AUTHENTICATION for group rooms
      if (!token) {
        socket.emit("room-error", { message: "Authentication required. Please log in to join group rooms." });
        return;
      }

      let userInfo = null;
      let userId = null;

      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
        const user = await User.findById(decoded.userId);
        if (!user) {
          socket.emit("room-error", { message: "Invalid user. Please log in again." });
          return;
        }
        userId = user._id.toString();
        userInfo = { name: user.name, age: user.age, sex: user.sex };
      } catch (error) {
        console.log("Token verification failed:", error);
        socket.emit("room-error", { message: "Authentication failed. Please log in again." });
        return;
      }

      // Check if room exists
      const room = await Room.findOne({ roomCode: roomCode.toLowerCase() });
      if (!room) {
        socket.emit("room-error", { message: "Room not found" });
        return;
      }

      // Check if room is full
      if (room.participants.length >= room.maxUsers) {
        socket.emit("room-full");
        return;
      }

      // Join socket room
      socket.join(roomCode);

      // Add participant to room
      const participant = {
        socketId: socket.id,
        userInfo,
        userId,
        joinedAt: new Date()
      };

      room.participants.push(participant);
      await room.save();

      // Send current participants to the new joiner (excluding themselves)
      const existingParticipants = room.participants.filter(p => p.socketId !== socket.id);
      socket.emit("existing-participants", {
        participants: existingParticipants
      });

      // Notify all existing participants about the new joiner
      socket.to(roomCode).emit("user-joined", {
        socketId: socket.id,
        userInfo,
        participants: room.participants.length
      });

      // Send room info to the new participant
      socket.emit("room-joined", {
        roomCode: room.roomCode,
        participants: room.participants.length,
        maxUsers: room.maxUsers
      });

    } catch (error) {
      console.error("Error joining custom room:", error);
      socket.emit("room-error", { message: "Failed to join room" });
    }
  });

  socket.on("leave-custom-room", async (data) => {
    try {
      const { roomCode } = data;

      // Find and update room
      const room = await Room.findOne({ roomCode: roomCode.toLowerCase() });
      if (room) {
        room.participants = room.participants.filter(p => p.socketId !== socket.id);
        await room.save();

        // Notify remaining participants
        socket.to(roomCode).emit("user-left", {
          socketId: socket.id,
          participants: room.participants.length
        });
      }

      // Leave socket room
      socket.leave(roomCode);

    } catch (error) {
      console.error("Error leaving custom room:", error);
    }
  });

  // WebRTC signaling for custom rooms
  socket.on("webrtc-offer", (data) => {
    const { targetSocketId, offer } = data;
    socket.to(targetSocketId).emit("webrtc-offer", {
      fromSocketId: socket.id,
      offer
    });
  });

  socket.on("webrtc-answer", (data) => {
    const { targetSocketId, answer } = data;
    socket.to(targetSocketId).emit("webrtc-answer", {
      fromSocketId: socket.id,
      answer
    });
  });

  socket.on("webrtc-ice", (data) => {
    const { targetSocketId, candidate } = data;
    socket.to(targetSocketId).emit("webrtc-ice", {
      fromSocketId: socket.id,
      candidate
    });
  });

  // Group chat messages
  socket.on("group-message", (data) => {
    const { roomCode, message } = data;
    const sender = "Anonymous"; // Could be enhanced with user info

    socket.to(roomCode).emit("group-message", {
      sender,
      message,
      timestamp: new Date()
    });
  });

  // --- Report user logic
  socket.on("report-user", async (data) => {
    try {
      const { reportedUserId, reason, details, roomId, screenshot } = data;
      const Report = require("./models/Report").default;

      // JWT verification
      let reporterId = null;
      const token = socket.handshake.auth?.token;
      if (token) {
        try {
          const jwt = require("jsonwebtoken");
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "your-secret-key"
          ) as any;
          reporterId = decoded.userId;
        } catch (err) {
          console.error("Token verification failed:", err);
        }
      }

      const report = new Report({
        reportedUser: reportedUserId,
        reporter: reporterId,
        reason,
        description: details,
        roomId,
        status: "pending",
        screenshot,
      });

      await report.save();

      io.of("/admin").emit("new-report", {
        report: report.toObject(),
        timestamp: new Date(),
      });

      console.log(`📝 Reported user: ${reportedUserId} - Reason: ${reason}`);
    } catch (err) {
      console.error("Report user error:", err);
      socket.emit("report-error", { message: "Failed to submit report" });
    }
  });

  // --- Custom room events
  socket.on("join-custom-room", async (data: { roomCode: string; userInfo?: any; userId?: string }) => {
    try {
      const { roomCode, userInfo, userId } = data;
      const lowerCode = roomCode.toLowerCase();

      // Check if room exists in DB
      const room = await Room.findOne({ roomCode: lowerCode });
      if (!room) {
        socket.emit("custom-room-error", { error: "Room not found" });
        return;
      }

      // Check capacity
      if (room.participants.length >= room.maxUsers) {
        socket.emit("custom-room-error", { error: "Room is full" });
        return;
      }

      // Add participant to room
      const participant = {
        socketId: socket.id,
        userInfo,
        userId
      };
      room.participants.push(participant);
      await room.save();

      // Join socket room
      socket.join(lowerCode);

      // Notify all participants in the room
      io.to(lowerCode).emit("custom-room-participant-joined", {
        participant,
        totalParticipants: room.participants.length
      });

      // Send current participants to the new joiner
      socket.emit("custom-room-joined", {
        roomCode: lowerCode,
        participants: room.participants,
        maxUsers: room.maxUsers
      });

    } catch (error) {
      console.error("Error joining custom room:", error);
      socket.emit("custom-room-error", { error: "Failed to join room" });
    }
  });

  socket.on("leave-custom-room", async (data: { roomCode: string }) => {
    try {
      const { roomCode } = data;
      const lowerCode = roomCode.toLowerCase();

      // Find room
      const room = await Room.findOne({ roomCode: lowerCode });
      if (!room) return;

      // Remove participant
      room.participants = room.participants.filter(p => p.socketId !== socket.id);

      // Leave socket room
      socket.leave(lowerCode);

      // If room is empty, delete it
      if (room.participants.length === 0) {
        await Room.deleteOne({ _id: room._id });
        io.to(lowerCode).emit("custom-room-deleted");
      } else {
        await room.save();
        // Notify remaining participants
        io.to(lowerCode).emit("custom-room-participant-left", {
          socketId: socket.id,
          totalParticipants: room.participants.length
        });
      }

    } catch (error) {
      console.error("Error leaving custom room:", error);
    }
  });

  // --- WebRTC signaling for custom rooms
  socket.on("custom-room-signal", (data: { roomCode: string; signal: any; to: string }) => {
    const { roomCode, signal, to } = data;
    socket.to(to).emit("custom-room-signal", { signal, from: socket.id });
  });
});

// ✅ Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
