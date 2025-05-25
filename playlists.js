import dbPromise from "./db.js";
("use strict");

export async function createPlaylist(name) {
  const db = await dbPromise;
  await db.run(`INSERT INTO playlists (name) VALUES (?)`, name);
}

export async function addTrackToPlaylist(playlistName, trackId) {
  const db = await dbPromise;
  const playlist = await db.get(
    `SELECT id FROM playlists WHERE name = ?`,
    playlistName
  );
  const track = await db.get(
    `SELECT id FROM history WHERE track_id = ?`,
    trackId
  );

  if (playlist && track) {
    await db.run(
      `INSERT INTO playlist_tracks (playlist_id, track_id) VALUES (?, ?)`,
      playlist.id,
      track.id
    );
  } else {
    throw new Error("Playlist or track not found");
  }
}

export async function getPlaylist(name) {
  const db = await dbPromise;
  return await db.all(
    `
    SELECT tracks.* FROM tracks
    JOIN playlist_tracks ON tracks.id = playlist_tracks.track_id
    JOIN playlists ON playlists.id = playlist_tracks.playlist_id
    WHERE playlists.name = ?
    ORDER BY played_at ASC
  `,
    name
  );
}

export async function getAllPlaylists() {
  const db = await dbPromise;
  const rows = await db.all("SELECT name FROM playlists");
  return rows.map((row) => row.name);
}

export async function deletePlaylist(name) {
  const db = await dbPromise;
  await db.run("DELETE FROM playlists WHERE name = ?", name);
}

export async function removeTrackFromPlaylist(playlistName, trackId) {
  const db = await dbPromise;

  // Get playlist ID
  const playlist = await db.get(
    "SELECT id FROM playlists WHERE name = ?",
    playlistName
  );
  if (!playlist) throw new Error("Playlist not found");

  // Delete track from playlist
  await db.run(
    "DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?",
    playlist.id,
    trackId
  );
}
