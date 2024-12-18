import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export const LocalVideo = ({
  socket,
  setSendingRTC,
}: {
  socket: Socket;
  setSendingRTC: (rtcInstance: RTCPeerConnection) => void;
}) => {
  const [localVideoTrack, setLocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);

  const localVideoTrackRef = useRef<HTMLVideoElement>();
  const localAudioTrackRef = useRef<HTMLVideoElement>();

  const setLocalMediaStream = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];

    setLocalAudioTrack(audioTrack);
    setLocalVideoTrack(videoTrack);
  };

  useEffect(() => {
    setLocalMediaStream();
    socket.on("request-sent", async ({ roomId }: { roomId: number }) => {
      console.log("request-sent by", socket.id);
      const rtcInstance = new RTCPeerConnection();

      if (localAudioTrack && localVideoTrack) {
        rtcInstance.addTrack(localAudioTrack);
        rtcInstance.addTrack(localVideoTrack);
      }

      setSendingRTC(rtcInstance);

      // onnegotiationneeded is callback used by RTCPeerConnection to update remote peer about you local machin information
      // this is basic use case but onnegotiationneeded do more than that
      rtcInstance.onnegotiationneeded = async () => {
        console.log("on negotiation neeeded, sending offer");
        const sdp = await rtcInstance.createOffer();
        rtcInstance.setLocalDescription(sdp);
        socket.emit("offer", {
          sdp,
          roomId,
        });
      };

      rtcInstance.onicecandidate = (e) => {
        console.log("onicecandidate local", e);
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "sendder",
            roomId,
          });
        }
      };
    });
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
      <video autoPlay ref={localVideoTrackRef} />;
    </>
  );
};
