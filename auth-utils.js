import { spotifyApi } from "./auth.js";

export async function getFreshSpotifyAccessToken(session) {
  if (!session.refresh_token) {
    throw new Error("Missing refresh token");
  }

  try {
    // Refresh token using spotify-web-api-node
    spotifyApi.setRefreshToken(session.refresh_token);
    const { body } = await spotifyApi.refreshAccessToken();

    // Save to session for future requests
    session.access_token = body.access_token;
    spotifyApi.setAccessToken(body.access_token);

    return body.access_token;
  } catch (err) {
    console.error("Token refresh failed:", err.message);
    throw new Error("Could not refresh Spotify access token");
  }
}
