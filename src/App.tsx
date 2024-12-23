import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";
import { Sender } from "./components/Sender";
import { Receiver } from "./components/Receiver";

const URL = "https://delightful-guan-malangave-12302ab7.koyeb.app";

// const URL = "http://localhost:8888";

function App() {
  const socketInitialized = useRef(false);
  const sessionId = useRef(localStorage.getItem("sessionId"));

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
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
      console.log("socket initializes");
    }
  }, []);

  return (
    <div>
      {socket && (
        <>
          <Sender socket={socket} />
          <Receiver socket={socket} />
        </>
      )}
    </div>
  );
}

export default App;
