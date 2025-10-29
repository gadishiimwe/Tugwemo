import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import { setupAdminSocket } from './socket/adminSocket';

// Import your existing logic
import { handelStart, handelDisconnect, getType } from './lib';
import { GetTypesResult, room } from './types';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tugwemo')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// --- Serve admin frontend ---
app.use('/admin', express.static(path.join(__dirname, "../admin/dist")));

// SPA routing for admin (for React/Vite frontend)
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../admin/dist/index.html"));
});

// --- Serve main frontend ---
app.use(express.static(path.join(__dirname, "../client/dist")));

// SPA routing (for React/Vite frontend)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// --- Example API endpoints ---
app.get("/api/status", (req, res) => {
  res.json({ status: "Server is running" });
});

app.post("/api/echo", (req, res) => {
  res.json({ received: req.body });
});

// --- HTTP server for Socket.io ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let online: number = 0;
let roomArr: Array<room> = [];

// Setup admin socket namespace
setupAdminSocket(io);

io.on('connection', (socket) => {
  online++;
  io.emit('online', online);

  // on start
  socket.on('start', cb => {
    handelStart(roomArr, socket, cb, io);
  });

  // On disconnect
  socket.on('disconnect', () => {
    online--;
    io.emit('online', online);
    handelDisconnect(socket.id, roomArr, io);
  });

  // On next
  socket.on('next', () => {
    handelDisconnect(socket.id, roomArr, io);
    handelStart(roomArr, socket, () => {
      socket.emit('remote-socket', socket.id);
    }, io);
  });

  /// WebRTC logic
  socket.on('ice:send', ({ candidate }) => {
    const type: GetTypesResult = getType(socket.id, roomArr);
    if (type) {
      if (type?.type === 'p1' && typeof type?.p2id === 'string') {
        io.to(type.p2id).emit('ice:reply', { candidate, from: socket.id });
      }
      if (type?.type === 'p2' && typeof type?.p1id === 'string') {
        io.to(type.p1id).emit('ice:reply', { candidate, from: socket.id });
      }
    }
  });

  socket.on('sdp:send', ({ sdp }) => {
    const type = getType(socket.id, roomArr);
    if (type) {
      if (type?.type === 'p1' && typeof type?.p2id === 'string') {
        io.to(type.p2id).emit('sdp:reply', { sdp, from: socket.id });
      }
      if (type?.type === 'p2' && typeof type?.p1id === 'string') {
        io.to(type.p1id).emit('sdp:reply', { sdp, from: socket.id });
      }
    }
  });

  // Messages
  socket.on("send-message", (input, type, roomid) => {
    const sender = type === 'p1' ? 'You: ' : 'Stranger: ';
    socket.to(roomid).emit('get-message', input, sender);
  });

  // Report user
  socket.on('report-user', async (data) => {
    try {
      const { reportedUserId, reason, roomId } = data;

      // Import Report model
      const Report = require('./models/Report').default;

      // Create report
      const report = new Report({
        reportedUserId,
        reporterId: socket.id, // Use socket ID as reporter identifier
        reason,
        roomId,
        status: 'pending'
      });

      await report.save();

      // Emit to admin namespace for real-time updates
      io.of('/admin').emit('new-report', {
        report: report.toObject(),
        timestamp: new Date()
      });

      console.log(`User reported: ${reportedUserId} - Reason: ${reason}`);
    } catch (error) {
      console.error('Report user error:', error);
      socket.emit('report-error', { message: 'Failed to submit report' });
    }
  });
});

// --- Start server ---
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
