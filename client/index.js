import { io } from 'socket.io-client';

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



// starts media capture
function start() {
  navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 44100,
      channelCount: 1
    },
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 }
    }
  })
    .then(stream => {
      localStream = stream;
      if (peer) {
        myVideo.srcObject = stream;
        stream.getTracks().forEach(track => peer.addTrack(track, stream));
      }
      // Set up audio context for volume control
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      gainNode = audioContext.createGain();
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.value = volume;
    })
    .catch(ex => {
      console.log(ex);
    });
}

// Check authentication on page load
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirect to login if not authenticated
    window.location.href = '/login.html';
  }
});

// connect ot server
const token = localStorage.getItem('token');
const socket = io('http://localhost:8000', {
  auth: {
    token: token
  }
});


// disconnectin event
socket.on('disconnected', () => {
  location.href = `/?disconnect`
})

// next button click
nextBtn.onclick = () => {
  // Disconnect current peer
  if (peer) {
    peer.close();
    peer = null;
  }
  // Clear videos
  myVideo.srcObject = null;
  strangerVideo.srcObject = null;
  // Show spinner
  document.querySelector('.modal').style.display = 'flex';
  // Emit next
  socket.emit('next');
}

// stop button click
stopBtn.onclick = () => {
  socket.emit('disconnect');
  location.href = '/';
}

// mute/unmute button click
muteBtn.onclick = () => {
  isMuted = !isMuted;
  if (localStream) {
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !isMuted;
    });
  }
  muteBtn.innerHTML = isMuted ? '<span class="btn-icon">🔊</span><span class="btn-text">Unmute</span>' : '<span class="btn-icon">🔇</span><span class="btn-text">Mute</span>';
}



// report stranger button click (new button next to stranger's name)
const reportStrangerBtn = document.getElementById('report-stranger');
reportStrangerBtn.onclick = () => {
  if (strangerInfo && strangerInfo.id) {
    const reason = prompt('Please provide a reason for reporting this user:');
    if (reason && reason.trim()) {
      socket.emit('report-user', {
        reportedUserId: strangerInfo.id,
        reason: reason.trim(),
        roomId: roomid
      });
      alert('User reported successfully. Thank you for helping keep our community safe.');
    }
  } else {
    alert('Unable to report user at this time.');
  }
}





/// --------- Web rtc related ---------

// Start 
socket.emit('start', (person) => {
  type = person;
});


// Get remote socket

socket.on('remote-socket', (id) => {
  remoteSocket = id;

  // hide the spinner
  document.querySelector('.modal').style.display = 'none';

  // create a peer conncection
  peer = new RTCPeerConnection();

  // on negociation needed
  peer.onnegotiationneeded = async e => {
    webrtc();
  }

  // send ice candidates to remotesocket
  peer.onicecandidate = e => {
    socket.emit('ice:send', { candidate: e.candidate, to: remoteSocket });
  }

  // handle incoming tracks
  peer.ontrack = e => {
    strangerVideo.srcObject = e.streams[0];
    strangerVideo.play();
  }

  // start media capture
  start();

});


// creates offer if 'type' = p1
async function webrtc() {

  if (type == 'p1') {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit('sdp:send', { sdp: peer.localDescription });
  }

}


// recive sdp sent by remote socket 
socket.on('sdp:reply', async ({ sdp, from }) => {

  // set remote description 
  await peer.setRemoteDescription(new RTCSessionDescription(sdp));

  // if type == p2, create answer
  if (type == 'p2') {
    const ans = await peer.createAnswer();
    await peer.setLocalDescription(ans);
    socket.emit('sdp:send', { sdp: peer.localDescription });
  }
});


// recive ice-candidate form remote socket
socket.on('ice:reply', async ({ candidate, from }) => {
  await peer.addIceCandidate(candidate);
});




/// ----------- Handel Messages Logic -----------


// get room id
socket.on('roomid', id => {
  roomid = id;
})

// handel send button click
function sendMessage() {
  // get input and emit
  let input = document.querySelector('input').value.trim();
  if (input === '') return;

  socket.emit('send-message', input, type, roomid);

  // set input in local message box as 'YOU'
  let msghtml = `
  <div class="msg">
  <b>You: </b> <span id='msg'>${input}</span>
  </div>
  `
  document.querySelector('.chat-wrapper')
  .innerHTML += msghtml;

  // scroll to bottom for sender
  document.querySelector('.chat-wrapper').scrollTop = document.querySelector('.chat-wrapper').scrollHeight;

  // clear input
  document.querySelector('input').value = '';
}

button.onclick = sendMessage;

// allow enter key to send message
document.querySelector('input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// on get message
socket.on('get-message', (input, type) => {

  // set recived message from server in chat box
  const strangerName = strangerInfo?.name || 'Stranger';
  let msghtml = `
  <div class="msg">
  <b>${strangerName}: </b> <span id='msg'>${input}</span>
  </div>
  `
  document.querySelector('.chat-wrapper')
  .innerHTML += msghtml;

  // only scroll to bottom if user is already at bottom, otherwise show notification
  if (isUserAtBottom) {
    document.querySelector('.chat-wrapper').scrollTop = document.querySelector('.chat-wrapper').scrollHeight;
  } else {
    newMessagesCountValue++;
    updateNewMessagesNotification();
  }

})

// Handle user info from server
socket.on('user-info', (data) => {
  strangerInfo = data.stranger;
  if (strangerInfo) {
    // Update the user info display if it exists
    const userNameEl = document.getElementById('stranger-name');
    const userAgeEl = document.getElementById('stranger-age');
    const strangerLabelEl = document.getElementById('stranger-label');
    if (userNameEl) userNameEl.textContent = strangerInfo.name;
    if (userAgeEl) userAgeEl.textContent = strangerInfo.age;
    if (strangerLabelEl) strangerLabelEl.textContent = strangerInfo.name;
  }
});

// Emoji picker functionality
const emojiBtn = document.getElementById('emoji-btn');
const emojiPicker = document.getElementById('emoji-picker');
const chatInput = document.querySelector('.chat-input input');

// New messages notification
const newMessagesNotification = document.getElementById('new-messages-notification');
const newMessagesCount = document.getElementById('new-messages-count');
let newMessagesCountValue = 0;
let isUserAtBottom = true;

emojiBtn.addEventListener('click', () => {
  emojiPicker.classList.toggle('show');
});

document.addEventListener('click', (e) => {
  if (!emojiBtn.contains(e.target) && !emojiPicker.contains(e.target)) {
    emojiPicker.classList.remove('show');
  }
});

emojiPicker.addEventListener('click', (e) => {
  if (e.target.classList.contains('emoji')) {
    const emoji = e.target.getAttribute('data-emoji');
    chatInput.value += emoji;
    chatInput.focus();
  }
});

// Track if user is at bottom of chat
const chatWrapper = document.querySelector('.chat-wrapper');
chatWrapper.addEventListener('scroll', () => {
  const isAtBottom = chatWrapper.scrollHeight - chatWrapper.scrollTop <= chatWrapper.clientHeight + 10;
  isUserAtBottom = isAtBottom;
  if (isAtBottom && newMessagesCountValue > 0) {
    newMessagesCountValue = 0;
    updateNewMessagesNotification();
  }
});

// Click notification to scroll to bottom
newMessagesNotification.addEventListener('click', () => {
  chatWrapper.scrollTop = chatWrapper.scrollHeight;
  newMessagesCountValue = 0;
  updateNewMessagesNotification();
  isUserAtBottom = true;
});

function updateNewMessagesNotification() {
  newMessagesCount.textContent = newMessagesCountValue;
  if (newMessagesCountValue > 0) {
    newMessagesNotification.classList.add('show');
  } else {
    newMessagesNotification.classList.remove('show');
  }
}
