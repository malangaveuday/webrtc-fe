// useEffect(() => {
const peerConnection = new RTCPeerConnection();

// Handle negotiationneeded
peerConnection.onnegotiationneeded = async () => {
  console.log("Negotiation needed.");
  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log("Local offer set. Sending to remote peer.");
    // Send offer to signaling server
  } catch (error) {
    console.error("Error during negotiation:", error);
  }
};

const addTrack = async () => {
  // Add a track
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
};

addTrack();
// Signaling state changes
peerConnection.onsignalingstatechange = () => {
  console.log("Signaling state:", peerConnection.signalingState);
};
//   }, []);
