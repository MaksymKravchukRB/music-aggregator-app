import eventBus from "../events.js";
import dbPromise from "../db.js";

eventBus.on("playlist:add-latest", async ({ playlistName }) => {
  const track = eventBus.getLastPlayedTrack?.();

  if (!track) {
    console.warn("[playlist:add-latest] No track in memory to add.");
    return;
  }

  try {
    const db = await dbPromise;

    // Get playlist ID
    const playlist = await db.get(
      `SELECT id FROM playlists WHERE name = ?`,
      playlistName
    );
    if (!playlist) throw new Error("Playlist not found");

    await db.run(
      `INSERT INTO playlist_tracks 
       (playlist_id, iframe_code, source, track_id, title, artist, album, uri, preview_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      playlist.id,
      track.iframe_code,
      track.source,
      track.track_id,
      track.title,
      track.artist,
      track.album,
      track.uri,
      track.preview_url
    );

    console.log(
      `[playlist:add-latest] Track "${track.title}" added to "${playlistName}"`
    );
  } catch (err) {
    console.error("[playlist:add-latest] Failed to add track:", err.message);
  }
});
