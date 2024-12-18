import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";
import { Sender } from "./components/Sender";
import { Receiver } from "./components/Receiver";

const URL = "energetic-sheri-malangave-e75cbb63.koyeb.app/:8888";

function App() {
  const socketInitialized = useRef(false);

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!socketInitialized.current) {
      const socket = io(URL);
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
