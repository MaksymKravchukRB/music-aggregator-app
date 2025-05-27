import eventBus from "../events.js";
import dbPromise from "../db.js";

// In-memory latest track cache
let lastPlayedTrack = null;

eventBus.on("track:played", async (trackData) => {
  const {
    iframe_code,
    source,
    track_id,
    title,
    artist,
    album,
    uri,
    preview_url,
  } = trackData;

  try {
    const db = await dbPromise;
    await db.run(
      `
      INSERT INTO history (iframe_code, source, track_id, title, artist, album, uri, preview_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      iframe_code,
      source,
      track_id,
      title,
      artist,
      album,
      uri,
      preview_url
    );

    lastPlayedTrack = trackData;

    console.log("[track:played] History entry logged:", title);
  } catch (err) {
    console.error("[track:played] Logging failed:", err.message);
  }
});

// Expose the last played track for other listeners
eventBus.getLastPlayedTrack = () => lastPlayedTrack;
