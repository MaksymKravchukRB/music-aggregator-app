import React, { useState, useRef, useEffect } from "react";
import IframeLoader from "./IframeLoader";

const SoundCloudSearchBar = ({ onTrackPlayed }) => {
  const [query, setQuery] = useState("");
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
        `/search/soundcloud?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("SoundCloud search failed");

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
      source: "soundcloud",
      track_id: item.id,
      title: item.title,
      artist: item.artist,
      album: item.album || null,
      uri: item.url,
      preview_url: null,
    });

    inputRef.current.blur();
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
      <h2>Search SoundCloud</h2>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search SoundCloud..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ flexGrow: 1, padding: "0.5rem" }}
        />
        <button onClick={handleSearch} style={{ padding: "0.5rem 1rem" }}>
          Search
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
          {dropdownResults.map((item) => (
            <li
              key={item.id}
              onClick={() => handleSelect(item)}
              style={{
                padding: "0.75rem",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              🎧 <strong>{item.title}</strong> — {item.artist}
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

export default SoundCloudSearchBar;
