import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

import { Sender } from "../components/Sender";
import { Receiver } from "../components/Receiver";

const URL = "http://localhost:8888";

export const VideoCallPage = ({
  localAudioTrack,
  localVideoTrack,
}: {
  localVideoTrack: MediaStreamTrack | null;
  localAudioTrack: MediaStreamTrack | null;
}) => {
  const socketInitialized = useRef(false);
  const sessionId = useRef(localStorage.getItem("sessionId"));

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    console.log("===  render ====");
    if (!socketInitialized.current) {
      if (!sessionId.current) {
        sessionId.current = `${Date.now()}`;
        localStorage.setItem("sessionId", sessionId.current);
      }
      const socket = io(URL, {
        auth: {
          sessionId: sessionId.current,
        },
      });
      socketInitialized.current = true;
      setSocket(socket);
    }
  }, []);
  return (
    <>
      {socket && (
        <>
          <Sender
            socket={socket}
            videoTrack={localVideoTrack}
            audioTrack={localAudioTrack}
          />
          <Receiver socket={socket} />
        </>
      )}
    </>
  );
};
