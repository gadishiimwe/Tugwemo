 // Custom Room JavaScript for Tugwemo
// Handles room creation and joining with codes

const BACKEND_URL = window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://tugwemo-backend.onrender.com';

// Global state for custom rooms
let currentRoomCode = null;
let isInCustomRoom = false;
let customRoomParticipants = [];
let customPeerConnections = new Map(); // socketId -> RTCPeerConnection

// Generate random room code
function generateRandomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Show/hide group options
function toggleGroupOptions() {
  const groupOptions = document.getElementById('group-options');
  if (groupOptions) {
    groupOptions.classList.toggle('show');
  }
}

// Create room with code
async function createRoom() {
  const codeInput = document.getElementById('room-code-input');
  const code = codeInput ? codeInput.value.trim() : '';

  if (!code) {
    showError('Please enter a room code');
    return;
  }

  if (code.length < 3 || code.length > 12) {
    showError('Room code must be 3-12 characters');
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/room/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode: code })
    });

    const data = await response.json();

    if (response.ok) {
      currentRoomCode = data.roomCode;
      showSuccess(`Room "${currentRoomCode}" created! Share this code with others.`);
      // Switch to waiting mode
      showWaitingForParticipants();
    } else {
      showError(data.error || 'Failed to create room');
    }
  } catch (error) {
    console.error('Error creating room:', error);
    showError('Failed to create room');
  }
}

// Join room with code
async function joinRoom() {
  const codeInput = document.getElementById('join-room-code-input');
  const code = codeInput ? codeInput.value.trim() : '';

  if (!code) {
    showError('Please enter a room code');
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/room/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode: code })
    });

    const data = await response.json();

    if (response.ok) {
      currentRoomCode = data.roomCode;
      showSuccess(`Joining room "${currentRoomCode}"...`);
      // Join via socket
      joinCustomRoomSocket(currentRoomCode);
    } else {
      showError(data.error || 'Failed to join room');
    }
  } catch (error) {
    console.error('Error joining room:', error);
    showError('Failed to join room');
  }
}

// Generate and set random code
function generateCode() {
  const codeInput = document.getElementById('room-code-input');
  if (codeInput) {
    codeInput.value = generateRandomCode();
  }
}

// Socket handling for custom rooms
function joinCustomRoomSocket(roomCode) {
  const token = localStorage.getItem('token');
  let userInfo = null;
  let userId = null;

  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      userId = decoded.userId;
      // Note: userInfo would need to be fetched from DB or stored locally
    } catch (error) {
      console.log('Token verification failed');
    }
  }

  socket.emit('join-custom-room', {
    roomCode,
    userInfo,
    userId
  });
}

// Leave custom room
function leaveCustomRoom() {
  if (currentRoomCode) {
    socket.emit('leave-custom-room', { roomCode: currentRoomCode });
    cleanupCustomRoom();
  }
}

// Cleanup custom room state
function cleanupCustomRoom() {
  currentRoomCode = null;
  isInCustomRoom = false;
  customRoomParticipants = [];
  customPeerConnections.forEach(pc => pc.close());
  customPeerConnections.clear();
  hideWaitingForParticipants();
}

// Show waiting for participants
function showWaitingForParticipants() {
  const waitingDiv = document.getElementById('waiting-participants');
  if (waitingDiv) {
    waitingDiv.classList.add('show');
  }
}

// Hide waiting for participants
function hideWaitingForParticipants() {
  const waitingDiv = document.getElementById('waiting-participants');
  if (waitingDiv) {
    waitingDiv.classList.remove('show');
  }
}

// Show error message
function showError(message) {
  const errorDiv = document.getElementById('custom-room-error');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    setTimeout(() => errorDiv.classList.remove('show'), 5000);
  }
}

// Show success message
function showSuccess(message) {
  const successDiv = document.getElementById('custom-room-success');
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.classList.add('show');
    setTimeout(() => successDiv.classList.remove('show'), 3000);
  }
}

// WebRTC setup for custom rooms
function setupCustomRoomWebRTC() {
  // This will be called when joining a custom room
  // Similar to existing WebRTC setup but for multiple participants
}

// Initialize custom room functionality
function initCustomRooms() {
  // Add event listeners
  const groupBtn = document.getElementById('group-btn');
  if (groupBtn) {
    groupBtn.addEventListener('click', toggleGroupOptions);
  }

  const createBtn = document.getElementById('create-room-btn');
  if (createBtn) {
    createBtn.addEventListener('click', createRoom);
  }

  const joinBtn = document.getElementById('join-room-btn');
  if (joinBtn) {
    joinBtn.addEventListener('click', joinRoom);
  }

  const generateBtn = document.getElementById('generate-code-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', generateCode);
  }

  const leaveBtn = document.getElementById('leave-custom-room-btn');
  if (leaveBtn) {
    leaveBtn.addEventListener('click', leaveCustomRoom);
  }
}

// Export functions for global use
window.CustomRoom = {
  init: initCustomRooms,
  createRoom,
  joinRoom,
  leaveRoom: leaveCustomRoom,
  generateCode
};
