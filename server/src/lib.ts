import { v4 as uuidv4 } from 'uuid';
import { GetTypesResult, room } from './types';
import User from './models/User';

export async function handelStart(roomArr: Array<room>, socket: any, cb: Function, io: any): Promise<void> {

  // Get user info from socket handshake
  const token = socket.handshake.auth?.token;
  let userInfo: { name: string; age: number } | null = null;

  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      const user = await User.findById(decoded.userId);
      if (user && user.name && typeof user.age === 'number') {
        userInfo = { name: user.name, age: user.age };
      }
    } catch (error) {
      console.log('Token verification failed:', error instanceof Error ? error.message : String(error));
    }
  }

  // check available rooms
  let availableroom = checkAvailableRoom();
  if (availableroom.is) {
    socket.join(availableroom.roomid);
    cb('p2');
    closeRoom(availableroom.roomid);
    if (availableroom?.room) {
      // Send user info to both participants
      io.to(availableroom.room.p1.id).emit('user-info', { stranger: userInfo });
      socket.emit('user-info', { stranger: availableroom.room.p1.userInfo });

      io.to(availableroom.room.p1.id).emit('remote-socket', socket.id);
      socket.emit('remote-socket', availableroom.room.p1.id);
      socket.emit('roomid', availableroom.room.roomid);
    }
  }
  // if no available room, create one
  else {
    let roomid = uuidv4();
    socket.join(roomid);
    roomArr.push({
      roomid,
      isAvailable: true,
      p1: {
        id: socket.id,
        userInfo: userInfo,
      },
      p2: {
        id: null,
        userInfo: null,
      }
    });
    cb('p1');
    socket.emit('roomid', roomid);
  }




  /**
   * 
   * @param roomid 
   * @desc search though roomArr and 
   * make isAvailable false, also se p2.id 
   * socket.id
   */
  function closeRoom(roomid: string): void {
    for (let i = 0; i < roomArr.length; i++) {
      if (roomArr[i].roomid == roomid) {
        roomArr[i].isAvailable = false;
        roomArr[i].p2.id = socket.id;
        roomArr[i].p2.userInfo = userInfo;
        break;
      }
    }
  }


  /**
   * 
   * @returns Object {is, roomid, room}
   * is -> true if foom is available
   * roomid -> id of the room, could be empth
   * room -> the roomArray, could be empty 
   */
  function checkAvailableRoom(): { is: boolean, roomid: string, room: room | null } {
    for (let i = 0; i < roomArr.length; i++) {
      if (roomArr[i].isAvailable) {
        return { is: true, roomid: roomArr[i].roomid, room: roomArr[i] };
      }
      if (roomArr[i].p1.id == socket.id || roomArr[i].p2.id == socket.id) {
        return { is: false, roomid: "", room: null };
      }
    }

    return { is: false, roomid: '', room: null };
  }
}

/**
 * @desc handels disconnceition event
 */
export function handelDisconnect(disconnectedId: string, roomArr: Array<room>, io: any) {
  for (let i = 0; i < roomArr.length; i++) {
    if (roomArr[i].p1.id == disconnectedId) {
      io.to(roomArr[i].p2.id).emit("disconnected");
      if (roomArr[i].p2.id) {
        roomArr[i].isAvailable = true;
        roomArr[i].p1.id = roomArr[i].p2.id;
        roomArr[i].p2.id = null;
      }
      else {
        roomArr.splice(i, 1);
      }
    } else if (roomArr[i].p2.id == disconnectedId) {
      io.to(roomArr[i].p1.id).emit("disconnected");
      if (roomArr[i].p1.id) {
        roomArr[i].isAvailable = true;
        roomArr[i].p2.id = null;
      }
      else {
        roomArr.splice(i, 1);
      }
    }
  }
}


// get type of person (p1 or p2)
export function getType(id: string, roomArr: Array<room>): GetTypesResult {
  for (let i = 0; i < roomArr.length; i++) {
    if (roomArr[i].p1.id == id) {
        return { type: 'p1', p2id: roomArr[i].p2.id };
    } else if (roomArr[i].p2.id == id) {
      return { type: 'p2', p1id: roomArr[i].p1.id };
    }
  }

  return false;
}