import React, { useEffect, useState } from "react";

const PlaylistManager = () => {
  const [playlists, setPlaylists] = useState([]);
  const [playlistContents, setPlaylistContents] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [newPlaylist, setNewPlaylist] = useState("");

  // Load playlist names
  const fetchPlaylists = async () => {
    const res = await fetch("/playlists");
    const data = await res.json();
    setPlaylists(data);
  };

  // Load tracks from a playlist
  const fetchPlaylistTracks = async (name) => {
    const res = await fetch(`/playlists/${encodeURIComponent(name)}`);
    const data = await res.json();
    setPlaylistContents((prev) => ({ ...prev, [name]: data }));
  };

  // Toggle dropdown for a playlist
  const handleToggle = (name) => {
    const isOpen = expanded === name;
    setExpanded(isOpen ? null : name);

    if (!isOpen && !playlistContents[name]) {
      fetchPlaylistTracks(name);
    }
  };

  // Create a new playlist
  const handleCreate = async () => {
    if (!newPlaylist.trim()) return;
    await fetch("/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPlaylist }),
    });
    setNewPlaylist("");
    fetchPlaylists();
  };

  const handlePlay = async (track) => {
    try {
      // Play by setting the embed URL (via event or global state if needed)
      const event = new CustomEvent("playTrack", {
        detail: {
          embed_url: track.iframe_code,
          metadata: track,
        },
      });
      window.dispatchEvent(event);
    } catch (err) {
      console.error("Failed to play track from playlist:", err.message);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  return (
    <div>
      <h2>Playlists</h2>

      <ul style={{ paddingLeft: 0, listStyle: "none" }}>
        {playlists.map((name) => (
          <li key={name} style={{ marginBottom: "1rem" }}>
            <button
              onClick={() => handleToggle(name)}
              style={{
                fontWeight: "bold",
                width: "100%",
                textAlign: "left",
                background: "#eee",
                padding: "0.5rem",
                border: "none",
                borderRadius: "4px",
              }}
            >
              {name}
            </button>

            {expanded === name &&
              Array.isArray(playlistContents[name]) &&
              playlistContents[name].length > 0 && (
                <ul style={{ marginTop: "0.5rem", paddingLeft: "1rem" }}>
                  {playlistContents[name].map((track, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        onClick={() => handlePlay(track)}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "1.1rem",
                        }}
                        title="Play track"
                      >
                        ▶️
                      </button>
                      <span>
                        {track.title} — <i>{track.artist}</i>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

            {expanded === name &&
              Array.isArray(playlistContents[name]) &&
              playlistContents[name].length === 0 && (
                <p style={{ margin: "0.5rem 0 0", fontStyle: "italic" }}>
                  (No tracks yet)
                </p>
              )}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "1rem" }}>
        <input
          type="text"
          placeholder="New playlist name"
          value={newPlaylist}
          onChange={(e) => setNewPlaylist(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
        />
        <button
          onClick={handleCreate}
          style={{
            width: "100%",
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "0.5rem",
            borderRadius: "4px",
          }}
        >
          ➕ Create Playlist
        </button>
      </div>
    </div>
  );
};

export default PlaylistManager;
