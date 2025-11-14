export interface room {
  roomid: string,
  isAvailable: boolean,
  p1: {
    id: string | null,
    userInfo?: { name: string, age?: number, sex?: string } | null,
    userId?: string | null,
  },
  p2: {
    id: string | null,
    userInfo?: { name: string, age?: number, sex?: string } | null,
    userId?: string | null,
  }
}

export type GetTypesResult = 
| { type: 'p1', p2id: string | null }
| { type: 'p2', p1id: string | null }
| false;

export interface RoomParticipant {
  socketId: string;
  userInfo?: { name: string, age?: number, sex?: string } | null;
  userId?: string | null;
}

export interface CustomRoom {
  roomCode: string;
  participants: RoomParticipant[];
  createdAt: Date;
  maxUsers: number;
}
