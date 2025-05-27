import React, { useState, useEffect } from "react";

const AddToPlaylistButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [selected, setSelected] = useState("");
  const [newPlaylist, setNewPlaylist] = useState("");
  const [status, setStatus] = useState("");

  const fetchPlaylists = async () => {
    const res = await fetch("/playlists");
    const data = await res.json();
    setPlaylists(data);
  };

  const handleAdd = async () => {
    const name = newPlaylist.trim() || selected;
    if (!name) return setStatus("Please select or enter a playlist");

    try {
      if (newPlaylist.trim()) {
        await fetch("/playlists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
      }

      await fetch(`/playlists/${encodeURIComponent(name)}/add`, {
        method: "POST",
      });

      setStatus(`✅ Track added to "${name}"`);
      setIsOpen(false);
      setNewPlaylist("");
      setSelected("");
    } catch (e) {
      console.error(e);
      setStatus("❌ Failed to add to playlist");
    }
  };

  useEffect(() => {
    if (isOpen) fetchPlaylists();
  }, [isOpen]);

  return (
    <div style={{ marginTop: "1rem" }}>
      <button onClick={() => setIsOpen((prev) => !prev)}>
        ➕ Add to Playlist
      </button>

      {isOpen && (
        <div
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <label>
            Select existing:
            <select
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value);
                setNewPlaylist("");
              }}
              style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
            >
              <option value="">-- choose --</option>
              {playlists.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "block", marginTop: "0.5rem" }}>
            Or create new:
            <input
              type="text"
              value={newPlaylist}
              onChange={(e) => {
                setNewPlaylist(e.target.value);
                setSelected("");
              }}
              placeholder="New playlist name"
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <button onClick={handleAdd} style={{ marginTop: "0.5rem" }}>
            Add
          </button>

          {status && (
            <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>{status}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AddToPlaylistButton;
