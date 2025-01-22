import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export const Sender = ({
  socket,
  videoTrack,
  audioTrack,
}: {
  socket: Socket;
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
}) => {
  const isComponentRendered = useRef(false);
  const rtcInstance = useRef<RTCPeerConnection>(new RTCPeerConnection());

  const [localVideoTrack, setLocalVideoTrack] =
    useState<MediaStreamTrack | null>(videoTrack);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(audioTrack);

  const localVideoTrackRef = useRef<HTMLVideoElement | null>(null);
  const localAudioTrackRef = useRef<HTMLAudioElement | null>(null);

  const setLocalMediaStream = async (
    rtcInstance?: RTCPeerConnection | undefined
  ) => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];

    if (rtcInstance) {
      rtcInstance.addTrack(audioTrack);
      rtcInstance.addTrack(videoTrack);
    }

    setLocalAudioTrack(audioTrack);
    setLocalVideoTrack(videoTrack);
  };

  useEffect(() => {
    if (!isComponentRendered.current) {
      isComponentRendered.current = true;

      socket.on("request-sent", async ({ roomId }) => {
        console.log("request received from second user", roomId);

        // onnegotiationneeded and onicecandidate this callback will registered
        // only when we added track to the same RTCPeerConnection
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
            console.log("Sende ICE candidate to Receiver");
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
        console.log("After anwsered");
        rtcInstance.current.setRemoteDescription(receiverSdp);
      });

      socket.on("add-ice-candidate", ({ candidate, type }) => {
        console.log(
          "request received from Receiver to add canditate to ICE connetion"
        );
        if (type == "receiver") {
          rtcInstance.current.addIceCandidate(candidate);
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    if (localVideoTrackRef.current && videoTrack) {
      localVideoTrackRef.current.srcObject = new MediaStream([videoTrack]);
    }
  }, [videoTrack]);

  useEffect(() => {
    if (localAudioTrackRef.current && audioTrack) {
      localAudioTrackRef.current.srcObject = new MediaStream([audioTrack]);
    }
  }, [audioTrack]);

  useEffect(() => {
    if (localVideoTrackRef.current && localVideoTrack) {
      localVideoTrackRef.current.srcObject = new MediaStream([localVideoTrack]);
    }
  }, [localVideoTrack]);

  useEffect(() => {
    if (localAudioTrackRef.current && localAudioTrack) {
      localAudioTrackRef.current.srcObject = new MediaStream([localAudioTrack]);
    }
  }, [localAudioTrack]);

  return (
    <div className="flex-1">
      {/* <audio autoPlay ref={localAudioTrackRef} /> */}
      <video autoPlay ref={localVideoTrackRef} width="100%" />
    </div>
  );
};
