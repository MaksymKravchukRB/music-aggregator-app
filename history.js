import dbPromise from "./db.js";
("use strict");

export async function getPlaybackHistory() {
  const db = await dbPromise;
  return await db.all(`SELECT * FROM history ORDER BY played_at DESC`);
}

export async function clearPlaybackHistory() {
  const db = await dbPromise;
  await db.run(`DELETE FROM history`);
}
