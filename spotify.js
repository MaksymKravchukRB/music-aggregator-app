import { spotifyApi } from "./auth.js";
import dbPromise from "./db.js";
("use strict");

export async function searchSpotifyEmbed(userSession, query, type = "track") {
  if (!userSession.access_token) throw new Error("No access token");

  spotifyApi.setAccessToken(userSession.access_token);

  let searchResult;

  if (type === "track") {
    searchResult = await spotifyApi.searchTracks(query, { limit: 1 });
  } else if (type === "album") {
    searchResult = await spotifyApi.searchAlbums(query, { limit: 1 });
  } else {
    throw new Error("Invalid type. Use 'track' or 'album'.");
  }

  const item =
    searchResult.body.tracks?.items[0] || searchResult.body.albums?.items[0];
  if (!item) throw new Error("No results found");

  return {
    title: item.name,
    artist: (item.artists || []).map((a) => a.name).join(", "),
    album: item.album?.name || item.name,
    spotify_uri: item.uri,
    embed_url: `https://open.spotify.com/embed/${type}/${item.id}`,
    image: item.album?.images?.[0]?.url || null,
  };
}

export async function searchSpotifyEmbedMultiple(
  userSession,
  query,
  type = "track"
) {
  if (!userSession.access_token) throw new Error("No access token");

  spotifyApi.setAccessToken(userSession.access_token);

  let searchResult;

  if (type === "track") {
    searchResult = await spotifyApi.searchTracks(query, { limit: 5 });
  } else if (type === "album") {
    searchResult = await spotifyApi.searchAlbums(query, { limit: 5 });
  } else {
    throw new Error("Invalid type. Use 'track' or 'album'.");
  }

  const items =
    searchResult.body.tracks?.items || searchResult.body.albums?.items || [];

  return items.map((item) => ({
    title: item.name,
    artist: (item.artists || []).map((a) => a.name).join(", "),
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
