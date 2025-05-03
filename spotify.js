import { spotifyApi } from "./auth.js";
import dbPromise from "./db.js";
("use strict");

export async function playSpotifyTrack(userSession, trackId) {
  if (!userSession.access_token) throw new Error("No access token");

  spotifyApi.setAccessToken(userSession.access_token);
  const track = await spotifyApi.getTrack(trackId);
  const metadata = track.body;

  await spotifyApi.play({
    uris: [`spotify:track:${trackId}`],
  });

  const db = await dbPromise;
  await db.run(
    `
    INSERT INTO tracks (source, track_id, title, artist, album, uri, preview_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    "spotify",
    trackId,
    metadata.name,
    metadata.artists.map((a) => a.name).join(", "),
    metadata.album.name,
    metadata.uri,
    metadata.preview_url || null
  );

  return metadata;
}
