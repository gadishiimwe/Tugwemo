import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';

// Import your existing logic
import { handelStart, handelDisconnect, getType } from './lib';
import { GetTypesResult, room } from './types';

const app = express();
app.use(cors());
app.use(express.json());

// --- Serve frontend ---
app.use(express.static(path.join(__dirname, "../public")));

// SPA routing (for React/Vite frontend)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
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
});

// --- Start server ---
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
