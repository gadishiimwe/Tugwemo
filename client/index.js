// ======================
// Tugwemo Video JS
// ======================

// Global State
let peer;
const myVideo = document.getElementById('my-video');
const strangerVideo = document.getElementById('video');
const button = document.getElementById('send');
const nextBtn = document.getElementById('next');
const stopBtn = document.getElementById('stop');
const muteBtn = document.getElementById('mute');
const online = document.getElementById('online');
let remoteSocket;
let type;
let roomid;
let localStream;
let audioContext;
let gainNode;
let isMuted = false;
let volume = 1;
let strangerInfo = null;
const findingUserOverlay = document.getElementById('finding-user-overlay');
let strangerStream = new MediaStream();
let isStrangerVideoSet = false;

// ======================
// Start camera/mic
// ======================
function start() {
  if (localStream) {
    myVideo.srcObject = localStream;
    if (peer) {
      localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
    }
    return;
  }

  navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    },
    video: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      facingMode: 'user'
    }
  }).then(stream => {
    localStream = stream;
    myVideo.srcObject = stream;

    if (peer) {
      stream.getTracks().forEach(track => peer.addTrack(track, stream));
    }

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    gainNode = audioContext.createGain();
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = volume;

    if (audioContext.state === 'suspended') audioContext.resume();

  }).catch(err => {
    console.error('Camera/Microphone access denied or error:', err);
    alert('Unable to access camera/microphone.');
  });
}

// ======================
// Check authentication
// ======================
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
  } else {
    start();
    if (window.AdManager) window.AdManager.initializeAds();
  }
});

// ======================
// Socket.IO setup
// ======================
const token = localStorage.getItem('token');
const socket = io('https://tugwemo-backend.onrender.com', {
  auth: { token },
  transports: ['websocket', 'polling']
});

// ======================
// Handle admin kick/ban
// ======================
socket.on('user-kicked', data => {
  alert('You have been kicked. Reason: ' + (data.reason || 'No reason provided'));
  socket.disconnect();
  localStorage.removeItem('token');
  location.href = '/login.html';
});

socket.on('user-banned', data => {
  alert('You have been banned. Reason: ' + (data.reason || 'No reason provided'));
  socket.disconnect();
  localStorage.removeItem('token');
  location.href = '/login.html';
});

// ======================
// Ads handling
// ======================
socket.on('ads-data', data => {
  if (window.AdManager && data.ads) {
    window.AdManager.currentAds = data.ads;
    if (findingUserOverlay.classList.contains('show') && data.ads.length > 0) {
      window.AdManager.showWaitingAd(data.ads[0]);
    }
    if (remoteSocket && data.ads.length > 1) {
      window.AdManager.showChatAd(data.ads[1]);
    }
  }
});

function fetchAdsForDisplay() {
  fetch('/api/auth/ads')
    .then(res => res.json())
    .then(data => {
      if (window.AdManager && data.ads) {
        window.AdManager.currentAds = data.ads;
        if (findingUserOverlay.classList.contains('show') && data.ads.length > 0) {
          window.AdManager.showWaitingAd(data.ads[0]);
        }
        if (remoteSocket && data.ads.length > 1) {
          window.AdManager.showChatAd(data.ads[1]);
        }
      }
    }).catch(err => console.error('Failed to fetch ads:', err));
}

// ======================
// Disconnect handling
// ======================
socket.on('disconnected', () => {
  if (localStream) localStream.getTracks().forEach(t => t.stop());
  if (strangerVideo.srcObject) strangerVideo.srcObject.getTracks().forEach(t => t.stop());
  if (peer) peer.close();
  location.href = '/?disconnect';
});

// ======================
// Buttons: Next, Stop, Mute
// ======================
nextBtn.onclick = () => {
  if (remoteSocket) {
    if (peer) peer.close();
    peer = null;
    if (strangerVideo.srcObject) strangerVideo.srcObject.getTracks().forEach(t => t.stop());
    strangerVideo.srcObject = null;
    myVideo.srcObject = localStream;
    strangerStream = new MediaStream();
    isStrangerVideoSet = false;
    findingUserOverlay.classList.add('show');
    nextBtn.innerHTML = '<span class="btn-text">Start</span>';
    socket.emit('next');
    remoteSocket = null;
    type = null;
    strangerInfo = null;
    fetchAdsForDisplay();
  } else {
    socket.emit('start', person => { type = person; });
    findingUserOverlay.classList.add('show');
    fetchAdsForDisplay();
  }
};

stopBtn.onclick = () => {
  if (localStream) localStream.getTracks().forEach(t => t.stop());
  if (strangerVideo.srcObject) strangerVideo.srcObject.getTracks().forEach(t => t.stop());
  if (peer) peer.close();
  socket.emit('disconnect');
  location.href = '/';
};

muteBtn.onclick = () => {
  isMuted = !isMuted;
  if (localStream) localStream.getAudioTracks().forEach(track => track.enabled = !isMuted);
  muteBtn.innerHTML = isMuted ? '<span class="btn-icon">🔊</span><span class="btn-text">Unmute</span>' : '<span class="btn-icon">🔇</span><span class="btn-text">Mute</span>';
};

// ======================
// Report modal
// ======================
function initializeReportModal() {
  const reportModal = document.getElementById('report-modal');
  const reportReasonSelect = document.getElementById('report-reason');
  const reportDetailsTextarea = document.getElementById('report-details');
  const reportSubmitBtn = document.querySelector('.report-modal-submit');
  const reportCancelBtn = document.querySelector('.report-modal-cancel');
  const reportCloseBtn = document.querySelector('.report-modal-close');
  const reportStrangerBtn = document.getElementById('report-stranger');

  if (reportStrangerBtn) {
    reportStrangerBtn.onclick = () => {
      reportReasonSelect.value = '';
      reportDetailsTextarea.value = '';
      reportSubmitBtn.disabled = false;
      reportSubmitBtn.textContent = 'Submit Report';
      reportModal.classList.add('show');
    };
  }

  if (reportCloseBtn) reportCloseBtn.onclick = () => reportModal.classList.remove('show');
  if (reportCancelBtn) reportCancelBtn.onclick = () => reportModal.classList.remove('show');
  if (reportSubmitBtn) {
    reportSubmitBtn.onclick = async () => {
      const reason = reportReasonSelect.value;
      const details = reportDetailsTextarea.value.trim();
      if (!reason) return alert('Select a reason.');
      if (!strangerInfo || !strangerInfo.id) return alert('No user connected.');

      reportSubmitBtn.disabled = true;
      reportSubmitBtn.textContent = 'Submitting...';

      try {
        const canvas = await html2canvas(document.body);
        const screenshotDataUrl = canvas.toDataURL('image/png');
        socket.emit('report-user', { reportedUserId: strangerInfo.id, reason, details, roomId: roomid, screenshot: screenshotDataUrl });
        alert('User reported successfully.');
        reportModal.classList.remove('show');
      } catch (err) {
        console.error(err);
        socket.emit('report-user', { reportedUserId: strangerInfo.id, reason, details, roomId: roomid });
        alert('User reported successfully.');
        reportModal.classList.remove('show');
      }
    };
  }
}

document.addEventListener('DOMContentLoaded', initializeReportModal);

// ======================
// WebRTC connection
// ======================
nextBtn.innerHTML = '<span class="btn-text">Start</span>';

socket.on('remote-socket', id => {
  remoteSocket = id;
  findingUserOverlay.classList.remove('show');
  const modal = document.querySelector('.modal');
  if (modal) modal.style.display = 'none';
  nextBtn.innerHTML = '<span class="btn-text">Next</span>';

  fetchAdsForDisplay();

  strangerStream = new MediaStream();
  isStrangerVideoSet = false;
  if (localStream) myVideo.srcObject = localStream;

  peer = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  });

  peer.onnegotiationneeded = async () => webrtc();
  peer.onicecandidate = e => { socket.emit('ice:send', { candidate: e.candidate, to: remoteSocket }); };
  peer.ontrack = e => {
    if (!isStrangerVideoSet && e.streams && e.streams[0]) {
      strangerVideo.srcObject = e.streams[0];
      isStrangerVideoSet = true;
      strangerVideo.setAttribute('playsinline', '');
      strangerVideo.setAttribute('autoplay', '');
      strangerVideo.volume = 1.0;
    }
    if (e.streams && e.streams[0]) {
      e.streams[0].getTracks().forEach(track => {
        if (!strangerStream.getTracks().find(t => t.id === track.id)) strangerStream.addTrack(track);
      });
    }
    strangerVideo.play().catch(err => { if (!err.message.includes('interrupted')) console.log('Video play error:', err.message); });
  };

  start();
});

async function webrtc() {
  if (type === 'p1') {
    const offer = await peer.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
    await peer.setLocalDescription(offer);
    socket.emit('sdp:send', { sdp: peer.localDescription });
  }
}

socket.on('sdp:reply', async ({ sdp, from }) => {
  await peer.setRemoteDescription(new RTCSessionDescription(sdp));
  if (type === 'p2') {
    const ans = await peer.createAnswer();
    await peer.setLocalDescription(ans);
    socket.emit('sdp:send', { sdp: peer.localDescription });
  }
  peer.addTransceiver('audio', { direction: 'sendrecv' });
  peer.addTransceiver('video', { direction: 'sendrecv' });
});

socket.on('ice:reply', async ({ candidate, from }) => {
  await peer.addIceCandidate(candidate);
});

// ======================
// Messaging
// ======================
socket.on('roomid', id => roomid = id);

function sendMessage() {
  const input = document.querySelector('input').value.trim();
  if (!input) return;
  socket.emit('send-message', input, type, roomid);

  const msghtml = `<div class="msg"><b>You: </b><span id='msg'>${input}</span></div>`;
  document.querySelector('.chat-wrapper').innerHTML += msghtml;
  document.querySelector('.chat-wrapper').scrollTop = document.querySelector('.chat-wrapper').scrollHeight;
  document.querySelector('input').value = '';
}

button.onclick = sendMessage;
document.querySelector('input').addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

socket.on('get-message', (input, type) => {
  const strangerName = strangerInfo?.name || 'Stranger';
  const msghtml = `<div class="msg"><b>${strangerName}: </b><span id='msg'>${input}</span></div>`;
  document.querySelector('.chat-wrapper').innerHTML += msghtml;
  if (isUserAtBottom) {
    document.querySelector('.chat-wrapper').scrollTop = document.querySelector('.chat-wrapper').scrollHeight;
  } else {
    newMessagesCountValue++;
    updateNewMessagesNotification();
  }
});

socket.on('user-info', data => {
  strangerInfo = data.stranger;
  const strangerLabelEl = document.getElementById('stranger-label');
  if (strangerInfo && strangerLabelEl) strangerLabelEl.textContent = strangerInfo.name || 'Anonymous';
  else if (strangerLabelEl) strangerLabelEl.textContent = 'Stranger';
});

// ======================
// Emoji picker
// ======================
const emojiBtn = document.getElementById('emoji-btn');
const emojiPicker = document.getElementById('emoji-picker');
const emojiList = document.getElementById('emoji-list');
const chatInput = document.querySelector('.chat-input input');

// Toggle emoji picker
emojiBtn.addEventListener('click', () => {
  emojiPicker.classList.toggle('show');
});

// Add emoji click behavior
emojiList.querySelectorAll('span').forEach(emoji => {
  emoji.addEventListener('click', () => {
    chatInput.value += emoji.textContent;
    emojiPicker.classList.remove('show');
    chatInput.focus();
  });
});


const chatWrapper = document.querySelector('.chat-wrapper');
chatWrapper.addEventListener('scroll', () => {
  const isAtBottom = chatWrapper.scrollHeight - chatWrapper.scrollTop <= chatWrapper.clientHeight + 10;
  isUserAtBottom = isAtBottom;
  if (isAtBottom && newMessagesCountValue > 0) {
    newMessagesCountValue = 0;
    updateNewMessagesNotification();
  }
});

newMessagesNotification.addEventListener('click', () => {
  chatWrapper.scrollTop = chatWrapper.scrollHeight;
  newMessagesCountValue = 0;
  updateNewMessagesNotification();
  isUserAtBottom = true;
});

function updateNewMessagesNotification() {
  newMessagesCount.textContent = newMessagesCountValue;
  if (newMessagesCountValue > 0) newMessagesNotification.classList.add('show');
  else newMessagesNotification.classList.remove('show');
}

// ======================
// Done
// ======================
console.log('Tugwemo index.js loaded successfully');
