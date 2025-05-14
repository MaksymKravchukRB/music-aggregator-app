import React, { useState, useRef, useEffect } from "react";
import IframeLoader from "./IframeLoader";

const SpotifySearchBar = ({ onTrackPlayed }) => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("track");
  const [dropdownResults, setDropdownResults] = useState([]);
  const [selectedEmbedUrl, setSelectedEmbedUrl] = useState("");
  const [selectedMetadata, setSelectedMetadata] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef();
  const lastLoggedTrackId = useRef(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const res = await fetch(
        `/search/spotify?q=${encodeURIComponent(query)}&type=${type}`
      );
      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setDropdownResults(data.results || []);
      setError("");
    } catch (err) {
      setError(err.message);
      setDropdownResults([]);
    }
  };

  const handleSelect = (item) => {
    setSelectedEmbedUrl(item.embed_url);
    setDropdownResults([]);
    setQuery("");

    setSelectedMetadata({
      source: "spotify",
      track_id: item.spotify_uri.split(":").pop(),
      title: item.title,
      artist: item.artist,
      album: item.album,
      uri: item.spotify_uri,
      preview_url: null,
    });

    inputRef.current.blur();
  };

  const toggleType = () => {
    setType((prev) => (prev === "track" ? "album" : "track"));
  };

  useEffect(() => {
    if (!selectedEmbedUrl || !selectedMetadata) return;

    const currentTrackId = selectedMetadata.track_id;

    if (lastLoggedTrackId.current === currentTrackId) return;

    const sendPlaybackEvent = async () => {
      try {
        await fetch("/playback/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            iframe_code: selectedEmbedUrl,
            ...selectedMetadata,
          }),
        });

        lastLoggedTrackId.current = currentTrackId;

        if (onTrackPlayed) onTrackPlayed();
      } catch (err) {
        console.error("Failed to log playback event:", err.message);
      }
    };

    sendPlaybackEvent();
  }, [selectedEmbedUrl, selectedMetadata, onTrackPlayed]);

  return (
    <div
      style={{
        position: "relative",
        maxWidth: 600,
        margin: "auto",
        padding: "1rem",
      }}
    >
      <h2>Search Spotify ({type})</h2>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          ref={inputRef}
          type="text"
          placeholder={`Search for a ${type}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ flexGrow: 1, padding: "0.5rem" }}
        />
        <button onClick={handleSearch} style={{ padding: "0.5rem 1rem" }}>
          Search
        </button>
        <button onClick={toggleType} style={{ padding: "0.5rem 1rem" }}>
          {type === "track" ? "Album Mode" : "Track Mode"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {dropdownResults.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #ccc",
            zIndex: 1000,
            listStyle: "none",
            margin: 0,
            padding: 0,
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {dropdownResults.slice(0, 5).map((item) => (
            <li
              key={item.spotify_uri}
              onClick={() => handleSelect(item)}
              style={{
                padding: "0.75rem",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              {type === "album" ? "💿" : "🎵"} <strong>{item.title}</strong> —{" "}
              {item.artist}
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: "1rem" }}>
        <IframeLoader embed_url={selectedEmbedUrl} />
      </div>
    </div>
  );
};

export default SpotifySearchBar;
