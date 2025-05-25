import React, { useState, useRef, useEffect } from "react";
import IframeLoader from "./IframeLoader";

const serviceSupportsAlbum = {
  spotify: true,
  bandcamp: true,
  soundcloud: true,
};

const UnifiedSearchBar = ({ onTrackPlayed }) => {
  const [platform, setPlatform] = useState("spotify");
  const [type, setType] = useState("track");
  const [query, setQuery] = useState("");
  const [dropdownResults, setDropdownResults] = useState([]);
  const [selectedEmbedUrl, setSelectedEmbedUrl] = useState("");
  const [selectedMetadata, setSelectedMetadata] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef();
  const containerRef = useRef();
  const lastLoggedTrackId = useRef(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const url = `/search/${platform}?q=${encodeURIComponent(query)}${
        serviceSupportsAlbum[platform] ? `&type=${type}` : ""
      }`;

      const res = await fetch(url);
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
      source: platform,
      track_id: item.id,
      title: item.title,
      artist: item.artist,
      album: item.album || null,
      uri: item.url,
      preview_url: null,
    });

    inputRef.current.blur();
  };

  const toggleType = () => {
    setType((prev) => (prev === "track" ? "album" : "track"));
  };

  useEffect(() => {
    const currentTrackId = selectedMetadata?.track_id;
    if (
      !selectedEmbedUrl ||
      !selectedMetadata ||
      lastLoggedTrackId.current === currentTrackId
    )
      return;

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
        console.error("Playback event failed:", err.message);
      }
    };

    sendPlaybackEvent();
  }, [selectedEmbedUrl, selectedMetadata, onTrackPlayed]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setDropdownResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        maxWidth: 600,
        margin: "auto",
        padding: "1rem",
      }}
    >
      <h2>
        Unified Search ({platform} - {type})
      </h2>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
        {["spotify", "bandcamp", "soundcloud"].map((service) => (
          <button
            key={service}
            onClick={() => setPlatform(service)}
            style={{
              padding: "0.5rem",
              fontWeight: platform === service ? "bold" : "normal",
            }}
          >
            {service.charAt(0).toUpperCase() + service.slice(1)}
          </button>
        ))}
        {serviceSupportsAlbum[platform] && (
          <button onClick={toggleType} style={{ padding: "0.5rem 1rem" }}>
            {type === "track" ? "Album Mode" : "Track Mode"}
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          ref={inputRef}
          type="text"
          placeholder={`Search ${platform} for a ${type}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          onFocus={() => {
            if (dropdownResults.length === 0 && query.length > 0) {
              handleSearch();
            }
          }}
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

export default UnifiedSearchBar;
