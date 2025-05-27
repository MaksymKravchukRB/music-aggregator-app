import React from "react";
import LoginButton from "./components/LoginButton";
import UnifiedSearchBar from "./components/UnifiedSearchBar";
import IframeLoader from "./components/IframeLoader";
import LiveHistory from "./components/LiveHistory";
import PlaylistManager from "./components/PlaylistManager";
import "./styles.css";

function App() {
  const clearHistory = async () => {
    await fetch("/history", { method: "DELETE" });

    // Emit event to refresh history
    window.dispatchEvent(new Event("history:refresh"));
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
          <UnifiedSearchBar />
          <IframeLoader />
          <LiveHistory />
          <button className="clear-btn" onClick={clearHistory}>
            Clear History
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
