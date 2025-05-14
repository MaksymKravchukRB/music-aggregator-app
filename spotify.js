import { spotifyApi } from "./auth.js";
import dbPromise from "./db.js";
("use strict");

export async function spotifySearch(session, query, type = "track") {
  if (!session?.refresh_token) {
    throw new Error("Missing session or refresh token.");
  }

  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
    query
  )}&type=${type}&limit=5`;

  const response = await fetch(url, {
    method: "GET",
    userSession: session,
  });

  const data = await response.json();

  const items = type === "album" ? data.albums?.items : data.tracks?.items;

  if (!items) {
    throw new Error("Spotify returned no results.");
  }

  return items.map((item) => ({
    title: item.name,
    artist: item.artists?.map((a) => a.name).join(", "),
    album: item.album?.name || item.name,
    spotify_uri: item.uri,
    embed_url: `https://open.spotify.com/embed/${type}/${item.id}`,
    image: item.album?.images?.[0]?.url || item.images?.[0]?.url || null,
  }));
}

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
    INSERT INTO history (iframe_code,source, track_id, title, artist, album, uri, preview_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    "none",
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
