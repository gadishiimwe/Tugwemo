import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

import adminRoutes from "./routes/admin";
import authRoutes from "./routes/auth";
import { setupAdminSocket } from "./socket/adminSocket";
import { handelStart, handelDisconnect, getType } from "./lib";
import Ad from "./models/Ad";
import User from "./models/User";

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
let roomArr: Array<any> = [];

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
    const type = getType(socket.id, roomArr);
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


});

// ✅ Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
