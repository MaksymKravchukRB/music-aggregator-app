import React, { useState } from "react";
import LoginButton from "./components/LoginButton";
import SpotifySearchBar from "./components/SpotifySearchbar";
import BandcampSearch from "./components/BandcampSearch";
import SoundCloudSearchBar from "./components/SoundCloudSearchBar";
import UnifiedSearchBar from "./components/UnifiedSearchBar";
import LiveHistory from "./components/LiveHistory";
import PlaylistManager from "./components/PlaylistManager";

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
      <>If you want to search Spotify, you will have to login: </>
      <LoginButton />
      <SpotifySearchBar onTrackPlayed={triggerHistoryRefresh} />
      <BandcampSearch onTrackPlayed={triggerHistoryRefresh} />
      <SoundCloudSearchBar onTrackPlayed={triggerHistoryRefresh} />
      <UnifiedSearchBar onTrackPlayed={triggerHistoryRefresh} />
      <LiveHistory refreshTrigger={refreshKey} />
      <button onClick={clearHistory}>Clear History</button>
    </div>
  );
}

export default App;
