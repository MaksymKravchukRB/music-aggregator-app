import React, { useEffect, useState } from "react";

const LiveHistory = () => {
  const [history, setHistory] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

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

  const replayTrack = (track) => {
    const { iframe_code, ...metadata } = track;

    window.dispatchEvent(
      new CustomEvent("playTrack", {
        detail: {
          embed_url: iframe_code,
          metadata,
        },
      })
    );
  };

  const deleteTrack = async (id) => {
    try {
      const res = await fetch(`/history/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadHistory();
      } else {
        console.error("Failed to delete history entry");
      }
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  return (
    <div>
      <h2>Playback History</h2>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {history.map((track, index) => (
          <li
            key={track.id || index}
            onClick={() => replayTrack(track)}
            onMouseEnter={() => setHoveredId(track.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              cursor: "pointer",
              padding: "6px 0",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between", // key change
            }}
          >
            {/* Track info */}
            <span>
              {track.source.toUpperCase()}: {track.title} by {track.artist}
            </span>

            {/* Delete button */}
            <span
              onClick={(e) => {
                e.stopPropagation(); // prevent replay
                deleteTrack(track.id);
              }}
              style={{
                visibility: hoveredId === track.id ? "visible" : "hidden",
                color: "red",
                marginLeft: "12px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ×
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveHistory;
