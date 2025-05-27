import dbPromise from "./db.js";
("use strict");

export async function createPlaylist(name) {
  const db = await dbPromise;
  await db.run(`INSERT INTO playlists (name) VALUES (?)`, name);
}

export async function addTrackToPlaylist(playlistName, track_id) {
  const db = await dbPromise;

  // Get the playlist ID
  const playlist = await db.get(
    `SELECT id FROM playlists WHERE name = ?`,
    playlistName
  );
  if (!playlist) throw new Error("Playlist not found");

  // Get track data from history
  const track = await db.get(
    `SELECT * FROM history WHERE track_id = ? ORDER BY played_at DESC LIMIT 1`,
    track_id
  );
  if (!track) throw new Error("Track not found in history");

  // Insert full metadata into playlist_tracks
  await db.run(
    `
    INSERT INTO playlist_tracks
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
}

export async function getPlaylist(name) {
  const db = await dbPromise;

  const playlist = await db.get(
    `SELECT id FROM playlists WHERE name = ?`,
    name
  );
  if (!playlist) throw new Error("Playlist not found");

  const tracks = await db.all(
    `SELECT * FROM playlist_tracks WHERE playlist_id = ?`,
    playlist.id
  );

  return tracks;
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

export async function removeTrackFromPlaylist(name, track_id) {
  const db = await dbPromise;

  const playlist = await db.get(
    `SELECT id FROM playlists WHERE name = ?`,
    name
  );
  if (!playlist) throw new Error("Playlist not found");

  await db.run(
    `
    DELETE FROM playlist_tracks
    WHERE id = (
      SELECT id FROM playlist_tracks
      WHERE playlist_id = ? AND track_id = ?
      ORDER BY id DESC LIMIT 1
    )
  `,
    playlist.id,
    track_id
  );
}
