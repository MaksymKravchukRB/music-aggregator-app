import React, { useState } from "react";
import AudioPlayer from "./components/AudioPlayer";
import BandcampControls from "./components/BandcampControls";
import LoginButton from "./components/LoginButton";
import IframeLoader from "./components/IframeLoader";
import SpotifySearchBar from "./components/SpotifySearchbar";
import LiveHistory from "./components/LiveHistory";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerHistoryRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const clearHistory = async () => {
    await fetch("/history", { method: "DELETE" });
    triggerHistoryRefresh();
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h1>Unified Music Playback</h1>
      <LoginButton />
      <AudioPlayer />
      <BandcampControls onTrackPlayed={triggerHistoryRefresh} />
      <SpotifySearchBar onTrackPlayed={triggerHistoryRefresh} />
      <LiveHistory refreshTrigger={refreshKey} />
      <button onClick={clearHistory}>Clear History</button>
    </div>
  );
}

export default App;
