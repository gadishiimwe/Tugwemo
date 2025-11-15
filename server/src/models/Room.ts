import mongoose, { Document, Schema } from 'mongoose';

export interface IRoomParticipant {
  socketId: string;
  userInfo?: { name: string; age?: number; sex?: string } | null;
  userId?: string | null;
}

export interface IRoom extends Document {
  roomCode: string;
  participants: IRoomParticipant[];
  createdAt: Date;
  maxUsers: number;
}

const RoomSchema: Schema = new Schema({
  roomCode: { type: String, required: true, unique: true, minlength: 3, maxlength: 12 },
  participants: [{
    socketId: { type: String, required: true },
    userInfo: {
      name: String,
      age: Number,
      sex: String
    },
    userId: String
  }],
  createdAt: { type: Date, default: Date.now, expires: 86400 }, // Auto-delete after 24 hours
  maxUsers: { type: Number, default: 6 }
});

// Index for efficient lookup
RoomSchema.index({ roomCode: 1 });

export default mongoose.model<IRoom>('Room', RoomSchema);
