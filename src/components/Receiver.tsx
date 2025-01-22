import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export const Receiver = ({ socket }: { socket: Socket }) => {
  const isComponentRendered = useRef(false);
  const rtcInstance = useRef<RTCPeerConnection>(new RTCPeerConnection());

  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<MediaStreamTrack | null>(null);

  const receiverVideoTrackRef = useRef<HTMLVideoElement | null>(null);
  const receiverAudioTrackRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isComponentRendered.current) {
      isComponentRendered.current = true;
      socket.on("offer", async ({ roomId, sdp }) => {
        console.log("receiver", roomId);
        // const rtcInstance = new RTCPeerConnection();
        //   set remote description
        await rtcInstance.current.setRemoteDescription(sdp);

        //   creating offer to send back
        const answerSdp = await rtcInstance.current.createAnswer();

        rtcInstance.current.setLocalDescription(answerSdp);

        rtcInstance.current.onnegotiationneeded = () => {
          console.log("Receiver rtc instance onnegotiationneeded");
        };

        socket.emit("answer", {
          roomId,
          sdp: answerSdp,
        });

        rtcInstance.current.onsignalingstatechange = () => {
          console.log(
            "Signaling state changed remote:",
            rtcInstance.current.signalingState
          );
        };

        // Handle ICE candidate generation
        rtcInstance.current.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("Receiver ICE:", event.candidate);
            // Send the candidate to the remote peer via the signaling server
            socket.emit("add-ice-candidate", {
              candidate: event.candidate,
              type: "receiver",
              roomId,
            });
          }
        };

        const [trackOne, trackTwo] = rtcInstance.current.getReceivers();

        if (receiverVideoTrackRef.current) {
          if (trackOne.track.kind === "video") {
            setRemoteVideoTrack(trackOne.track);
            setRemoteAudioTrack(trackTwo.track);
          } else {
            setRemoteVideoTrack(trackTwo.track);
            setRemoteAudioTrack(trackOne.track);
          }
        }
      });

      socket.on("add-ice-candidate", ({ candidate, type }) => {
        console.log("add-ice-candidate receiver", { candidate, type });
        if (type == "sender") {
          rtcInstance.current.addIceCandidate(candidate);
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    if (receiverAudioTrackRef.current && remoteAudioTrack) {
      receiverAudioTrackRef.current.srcObject = new MediaStream([
        remoteAudioTrack,
      ]);
      receiverAudioTrackRef.current?.play();
    }
  }, [receiverAudioTrackRef, remoteAudioTrack]);

  useEffect(() => {
    if (receiverVideoTrackRef.current && remoteVideoTrack) {
      receiverVideoTrackRef.current.srcObject = new MediaStream([
        remoteVideoTrack,
      ]);
      receiverVideoTrackRef.current?.play();
    }
  }, [receiverVideoTrackRef, remoteVideoTrack]);

  return (
    <>
      {/* <audio autoPlay ref={receiverAudioTrackRef} /> */}
      <video autoPlay ref={receiverVideoTrackRef} />
    </>
  );
};
