import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router";

export const LandingPage = ({
  setSender,
  localVideoTrack,
  localAudioTrack,
}: {
  setSender: React.Dispatch<React.SetStateAction<{ name: string }>>;
  localVideoTrack: MediaStreamTrack | null;
  localAudioTrack: MediaStreamTrack | null;
}) => {
  const localVideoTrackRef = useRef<HTMLVideoElement | null>(null);
  const localAudioTrackRef = useRef<HTMLAudioElement | null>(null);
  const [senderName, setSenderName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localVideoTrackRef.current && localVideoTrack) {
      localVideoTrackRef.current.srcObject = new MediaStream([localVideoTrack]);
      localVideoTrackRef.current?.play();
    }
  }, [localVideoTrack]);

  useEffect(() => {
    if (localAudioTrackRef.current && localAudioTrack) {
      localAudioTrackRef.current.srcObject = new MediaStream([localAudioTrack]);
      localAudioTrackRef.current?.play();
    }
  }, [localAudioTrack]);

  const handleConnectClick = () => {
    setSender({ name: senderName });
    navigate("/connect");
  };

  return (
    <div className="w-full h-screen landiing-page flex items-center justify-center">
      <div className="flex items-center justify-center flex-col gap-3 landing-page-container">
        <div className="rounded-lg overflow-hidden w-full">
          {/* <audio autoPlay ref={localAudioTrackRef} /> */}
          <video autoPlay ref={localVideoTrackRef} />
        </div>
        <input
          className="border w-full p-2 rounded-lg"
          placeholder="Please enter your peer connection name"
          onChange={(e) => setSenderName(e.target.value)}
        />
        <button
          className="bg-indigo-400 p-2 rounded text-white uppercase"
          onClick={handleConnectClick}
        >
          Connect with random peer
        </button>
      </div>
    </div>
  );
};
