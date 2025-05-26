import React, { useState } from "react";
import LoginButton from "./components/LoginButton";
import SpotifySearchBar from "./components/SpotifySearchbar";
import BandcampSearch from "./components/BandcampSearch";
import SoundCloudSearchBar from "./components/SoundCloudSearchBar";
import UnifiedSearchBar from "./components/UnifiedSearchBar";
import LiveHistory from "./components/LiveHistory";
import PlaylistManager from "./components/PlaylistManager";
import "./styles.css"; // Import global stylesheet

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
    <div className="app">
      <aside className="sidebar">
        <PlaylistManager />
      </aside>

      <main className="content">
        <div className="content-inner">
          <h1>Unified Music Playback</h1>
          <p>If you want to search Spotify, you will have to login:</p>
          <LoginButton />
          <SpotifySearchBar onTrackPlayed={triggerHistoryRefresh} />
          <BandcampSearch onTrackPlayed={triggerHistoryRefresh} />
          <SoundCloudSearchBar onTrackPlayed={triggerHistoryRefresh} />
          <UnifiedSearchBar onTrackPlayed={triggerHistoryRefresh} />
          <LiveHistory refreshTrigger={refreshKey} />
          <button className="clear-btn" onClick={clearHistory}>
            Clear History
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
