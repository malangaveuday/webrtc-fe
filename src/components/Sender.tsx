import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export const Sender = ({ socket }: { socket: Socket }) => {
  const isComponentRendered = useRef(false);
  const rtcInstance = useRef<RTCPeerConnection>(new RTCPeerConnection());

  const [localVideoTrack, setLocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [sendingRtc, setSendingRTC] = useState<RTCPeerConnection | null>();

  const localVideoTrackRef = useRef<HTMLVideoElement>();
  const localAudioTrackRef = useRef<HTMLAudioElement>();

  const setLocalMediaStream = async (rtcInstance) => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];

    rtcInstance.addTrack(audioTrack);
    rtcInstance.addTrack(videoTrack);

    console.log({ audioTrack, videoTrack });

    setLocalAudioTrack(audioTrack);
    setLocalVideoTrack(videoTrack);
  };

  useEffect(() => {
    if (!isComponentRendered.current) {
      isComponentRendered.current = true;

      socket.on("request-sent", async ({ roomId }) => {
        console.log("received", roomId);

        // onnegotiationneeded and onicecandidate this callback will registered
        // only when we added trac to the RTCPeerConnection

        rtcInstance.current.onnegotiationneeded = async () => {
          console.log("Sender rtc instance onnegotiationneeded");
          //  create offer which return sdp (session description protocol)
          const sdp = await rtcInstance.current.createOffer();

          rtcInstance.current.setLocalDescription(sdp);

          socket.emit("offer", {
            roomId,
            sdp,
          });
        };

        // Handle ICE candidate generation
        rtcInstance.current.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("Sender ICE:", event.candidate);
            // Send the candidate to the remote peer via the signaling server
            // signalingServer.send({ type: "candidate", candidate: event.candidate });

            socket.emit("add-ice-candidate", {
              candidate: event.candidate,
              type: "sender",
              roomId,
            });
          }
        };

        setLocalMediaStream(rtcInstance.current);
      });

      socket.on("answer", async ({ roomId, sdp: receiverSdp }) => {
        rtcInstance.current.setRemoteDescription(receiverSdp);
      });

      socket.on("add-ice-candidate", ({ candidate, type }) => {
        console.log("add-ice-candidate sender", { candidate, type });
        if (type == "receiver") {
          rtcInstance.current.addIceCandidate(candidate);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (localVideoTrackRef.current && localVideoTrack) {
      localVideoTrackRef.current.srcObject = new MediaStream([localVideoTrack]);
      localVideoTrackRef.current?.play();
    }
  }, [localVideoTrackRef, localVideoTrack]);

  useEffect(() => {
    if (localAudioTrackRef.current && localAudioTrack) {
      localAudioTrackRef.current.srcObject = new MediaStream([localAudioTrack]);
      localAudioTrackRef.current?.play();
    }
  }, [localAudioTrackRef, localAudioTrack]);

  return (
    <>
      {/* <audio autoPlay ref={localAudioTrackRef} /> */}
      <video autoPlay ref={localVideoTrackRef} />
    </>
  );
};
