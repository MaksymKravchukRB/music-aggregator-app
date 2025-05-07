import sqlite3 from "sqlite3";
import { open } from "sqlite";
("use strict");

const dbPromise = open({
  filename: "./database.sqlite",
  driver: sqlite3.Database,
});

export async function initDb() {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      iframe_code TEXT,
      source TEXT CHECK(source IN ('spotify', 'bandcamp', 'soundcloud')),
      track_id TEXT,
      title TEXT,
      artist TEXT,
      album TEXT,
      uri TEXT,
      preview_url TEXT,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS playlist_tracks (
      playlist_id INTEGER,
      track_id INTEGER,
      FOREIGN KEY (playlist_id) REFERENCES playlists(id),
      FOREIGN KEY (track_id) REFERENCES tracks(id)
    );
  `);
}

export default dbPromise;
