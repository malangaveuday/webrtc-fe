import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";

import { LandingPage } from "./pages/LandingPage";
import { VideoCallPage } from "./pages/VideoCallPage";
import { useLocalMediaStream } from "./utils/useLocalMediaStream";

export const AppRouter = () => {
  const [sender, setSender] = useState<{ name: string }>({ name: "" });
  const [localVideoTrack, localAudioTrack] = useLocalMediaStream();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              setSender={setSender}
              localVideoTrack={localVideoTrack}
              localAudioTrack={localAudioTrack}
            />
          }
        />
        <Route
          path="/connect"
          element={
            <VideoCallPage
              localVideoTrack={localVideoTrack}
              localAudioTrack={localAudioTrack}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
