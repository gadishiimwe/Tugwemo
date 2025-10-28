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



// starts media capture
function start() {
  navigator.mediaDevices.getUserMedia({ audio: true, video: true })
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

// connect ot server
const socket = io('http://localhost:8000');


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
  let msghtml = `
  <div class="msg">
  <b>Stranger: </b> <span id='msg'>${input}</span>
  </div>
  `
  document.querySelector('.chat-wrapper')
  .innerHTML += msghtml;

})
