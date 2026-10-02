/**
 * WebRTC P2P Direct Transfer Engine with STUN/TURN Fallback
 */

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export class WebRTCManager {
  constructor(socket, isSender = true) {
    this.socket = socket;
    this.isSender = isSender;
    this.peer = null;
    this.dataChannel = null;
    this.isConnected = false;
  }

  initConnection(targetSocketId = null) {
    this.peer = new RTCPeerConnection(RTC_CONFIG);

    this.peer.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('webrtc:ice-candidate', {
          candidate: event.candidate,
          targetSocketId
        });
      }
    };

    if (this.isSender) {
      this.dataChannel = this.peer.createDataChannel('fileTransfer', {
        ordered: true
      });
      this.setupDataChannel(this.dataChannel);
    } else {
      this.peer.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.setupDataChannel(this.dataChannel);
      };
    }
  }

  setupDataChannel(channel) {
    channel.onopen = () => {
      console.log('WebRTC DataChannel opened successfully!');
      this.isConnected = true;
    };

    channel.onclose = () => {
      console.log('WebRTC DataChannel closed');
      this.isConnected = false;
    };

    channel.onerror = (err) => {
      console.warn('WebRTC DataChannel error:', err);
      this.isConnected = false;
    };
  }

  async createOffer(targetSocketId) {
    this.initConnection(targetSocketId);
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(offer);

    this.socket.emit('webrtc:offer', {
      offer,
      targetSocketId
    });
  }

  async handleOffer(offer, senderSocketId) {
    this.initConnection(senderSocketId);
    await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(answer);

    this.socket.emit('webrtc:answer', {
      answer,
      targetSocketId: senderSocketId
    });
  }

  async handleAnswer(answer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  async addIceCandidate(candidate) {
    if (this.peer) {
      await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  sendChunk(chunkBuffer) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(chunkBuffer);
      return true;
    }
    return false;
  }

  close() {
    if (this.dataChannel) this.dataChannel.close();
    if (this.peer) this.peer.close();
    this.isConnected = false;
  }
}
