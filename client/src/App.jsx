import React, { useEffect, useState } from "react";
import AudioPlayer from "./components/AudioPlayer";
import BandcampControls from "./components/BandcampControls";
import HistoryList from "./components/HistoryList";
import LoginButton from "./components/LoginButton";

function App() {
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    const res = await fetch("/history");
    const data = await res.json();
    setHistory(data);
  };

  const clearHistory = async () => {
    await fetch("/history", { method: "DELETE" });
    loadHistory();
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div>
      <h1>Unified Music Playback</h1>
      <LoginButton />
      <AudioPlayer />
      <BandcampControls reloadHistory={loadHistory} />
      <HistoryList history={history} />
      <button onClick={clearHistory}>Clear History</button>
    </div>
  );
}

export default App;
