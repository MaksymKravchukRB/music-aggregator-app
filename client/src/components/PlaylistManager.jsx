import React, { useState, useEffect } from "react";

const PlaylistManager = () => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [expanded, setExpanded] = useState({});
  const [playlistContents, setPlaylistContents] = useState({});

  const fetchPlaylists = async () => {
    try {
      const res = await fetch("/playlists");
      const data = await res.json();
      setPlaylists(data);
    } catch (err) {
      console.error("Failed to fetch playlists:", err.message);
    }
  };

  const fetchPlaylistContents = async (name) => {
    if (playlistContents[name]) return;
    try {
      const res = await fetch(`/playlists/${name}`);
      const data = await res.json();
      setPlaylistContents((prev) => ({ ...prev, [name]: data }));
    } catch (err) {
      console.error(`Failed to fetch contents for ${name}:`, err.message);
    }
  };

  const handleCreate = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      await fetch("/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPlaylistName }),
      });
      setNewPlaylistName("");
      fetchPlaylists();
    } catch (err) {
      console.error("Failed to create playlist:", err.message);
    }
  };

  const handleDelete = async (name) => {
    try {
      await fetch(`/playlists/${name}`, { method: "DELETE" });
      setPlaylists((prev) => prev.filter((p) => p !== name));
      setExpanded((prev) => ({ ...prev, [name]: false }));
    } catch (err) {
      console.error("Failed to delete playlist:", err.message);
    }
  };

  const handleTrackRemove = async (playlistName, trackId) => {
    try {
      await fetch(`/playlists/${playlistName}/${trackId}`, {
        method: "DELETE",
      });
      // Refresh contents
      const updated = await fetch(`/playlists/${playlistName}`).then((r) =>
        r.json()
      );
      setPlaylistContents((prev) => ({ ...prev, [playlistName]: updated }));
    } catch (err) {
      console.error("Failed to remove track:", err.message);
    }
  };

  const toggleDropdown = (name) => {
    setExpanded((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
    if (!playlistContents[name]) {
      fetchPlaylistContents(name);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  return (
    <div
      style={{ maxWidth: 300, padding: "1rem", borderLeft: "1px solid #ccc" }}
    >
      <h2>Playlists</h2>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="New playlist name"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <button onClick={handleCreate} style={{ width: "100%" }}>
          Create Playlist
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {playlists.map((name) => (
          <li key={name} style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => toggleDropdown(name)}
                style={{ flexGrow: 1, textAlign: "left" }}
              >
                {expanded[name] ? "▼" : "▶"} {name}
              </button>
              <button
                onClick={() => handleDelete(name)}
                style={{ color: "red" }}
              >
                ✖
              </button>
            </div>
            {expanded[name] && (
              <ul style={{ marginTop: "0.5rem", paddingLeft: "1rem" }}>
                {playlistContents[name]?.map((track, i) => (
                  <li
                    key={i}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>
                      {track.title} – {track.artist}
                    </span>
                    <button
                      style={{ marginLeft: "1rem", color: "red" }}
                      onClick={() => handleTrackRemove(name, track.track_id)}
                    >
                      ✖
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlaylistManager;
