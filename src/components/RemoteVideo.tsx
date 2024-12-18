import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export const RemoteVideo = ({
  setReceivingRTC,
  setSendingRTC,
  socket,
}: {
  socket: Socket;
  setReceivingRTC: (rtcInstance: RTCPeerConnection) => void;
  setSendingRTC: (rtcInstance: RTCPeerConnection) => void;
}) => {
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<MediaStreamTrack | null>(null);

  const remoteVideoTrackRef = useRef<HTMLVideoElement>();
  const remoteAudioTrackRef = useRef<HTMLVideoElement>();
  const remoteVideoRef = useRef<HTMLVideoElement>();

  useEffect(() => {
    socket.on("offer", async ({ sdp: remoteSdp, roomId }) => {
      console.log("FE offer");
      // send acknowledgment
      const rtcInstance = new RTCPeerConnection();
      rtcInstance.setRemoteDescription(remoteSdp);

      const sdp = await rtcInstance.createAnswer();
      rtcInstance.setLocalDescription(sdp);

      setReceivingRTC(rtcInstance);

      rtcInstance.onicecandidate = async (e) => {
        console.log("onicecandidate remote", e);
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
            roomId,
          });
        }
      };

      socket.emit("answer", {
        roomId,
        sdp,
      });

      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }

      const track1 = rtcInstance.getTransceivers()[0].receiver.track;
      const track2 = rtcInstance.getTransceivers()[1].receiver.track;

      console.log({ track1, track2 });

      //@ts-ignore
      remoteVideoRef.current.srcObject.addTrack(track1);
      //@ts-ignore
      remoteVideoRef.current.srcObject.addTrack(track2);
      //@ts-ignore
      remoteVideoRef.current.play();
    });
    socket.on("answer", ({ sdp, roomId }) => {
      console.log("akcledged offer", sdp, roomId);

      //@ts-ignore
      setSendingRTC((sendingRTC) => {
        sendingRTC.setRemoteDescription(sdp);
        return sendingRTC;
      });
    });

    socket.on("add-ice-candidate", ({ candidate, type }) => {
      console.log("add ice candidate from remote");
      console.log({ candidate, type });
      if (type == "sender") {
        //@ts-ignore
        setReceivingRTC((receivingRTC) => {
          if (!receivingRTC) {
            console.error("receicng pc nout found");
          } else {
            console.error(receivingRTC.ontrack);
          }
          receivingRTC?.addIceCandidate(candidate);
          return receivingRTC;
        });
      } else {
        //@ts-ignore
        setSendingRTC((sendingRTC) => {
          if (!sendingRTC) {
            console.error("sending pc nout found");
          } else {
            // console.error(pc.ontrack)
          }
          sendingRTC?.addIceCandidate(candidate);
          return sendingRTC;
        });
      }
    });
  }, []);
  return <video autoPlay width={400} height={400} ref={remoteVideoRef} />;
};
