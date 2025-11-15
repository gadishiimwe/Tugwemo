import express from 'express';
import Room from '../models/Room';
import { Request, Response } from 'express';

const router = express.Router();

// POST /api/room/create
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { roomCode, maxUsers = 6 } = req.body;

    // Validate roomCode
    if (!roomCode || typeof roomCode !== 'string') {
      return res.status(400).json({ error: 'Room code is required' });
    }

    const codeLength = roomCode.length;
    if (codeLength < 3 || codeLength > 12) {
      return res.status(400).json({ error: 'Room code must be 3-12 characters long' });
    }

    // Check if room code already exists
    const existingRoom = await Room.findOne({ roomCode: roomCode.toLowerCase() });
    if (existingRoom) {
      return res.status(409).json({ error: 'Room code already in use' });
    }

    // Create new room
    const room = new Room({
      roomCode: roomCode.toLowerCase(),
      participants: [],
      maxUsers
    });

    await room.save();

    res.status(201).json({
      message: 'Room created successfully',
      roomCode: room.roomCode,
      maxUsers: room.maxUsers
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/room/join
router.post('/join', async (req: Request, res: Response) => {
  try {
    const { roomCode } = req.body;

    if (!roomCode || typeof roomCode !== 'string') {
      return res.status(400).json({ error: 'Room code is required' });
    }

    // Find room
    const room = await Room.findOne({ roomCode: roomCode.toLowerCase() });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check capacity
    if (room.participants.length >= room.maxUsers) {
      return res.status(403).json({ error: 'Room is full' });
    }

    res.status(200).json({
      message: 'Room joined successfully',
      roomCode: room.roomCode,
      participants: room.participants.length,
      maxUsers: room.maxUsers
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/room/leave
router.post('/leave', async (req: Request, res: Response) => {
  try {
    const { roomCode, socketId } = req.body;

    if (!roomCode || !socketId) {
      return res.status(400).json({ error: 'Room code and socket ID are required' });
    }

    // Find and update room
    const room = await Room.findOne({ roomCode: roomCode.toLowerCase() });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Remove participant
    room.participants = room.participants.filter(p => p.socketId !== socketId);

    // Delete room if empty
    if (room.participants.length === 0) {
      await Room.deleteOne({ _id: room._id });
      return res.status(200).json({ message: 'Room deleted - no participants left' });
    }

    await room.save();

    res.status(200).json({
      message: 'Left room successfully',
      participants: room.participants.length
    });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
