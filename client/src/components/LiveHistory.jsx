import React, { useEffect, useState } from "react";

const LiveHistory = () => {
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    const res = await fetch("/history");
    const data = await res.json();
    setHistory(data);
  };

  useEffect(() => {
    loadHistory();

    const handler = () => loadHistory();
    window.addEventListener("history:refresh", handler);

    return () => window.removeEventListener("history:refresh", handler);
  }, []);

  return (
    <div>
      <h2>Playback History</h2>
      <ul>
        {history.map((track, index) => (
          <li key={index}>
            {track.source.toUpperCase()}: {track.title} by {track.artist}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveHistory;
