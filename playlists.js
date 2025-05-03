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
    `SELECT id FROM tracks WHERE track_id = ?`,
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
