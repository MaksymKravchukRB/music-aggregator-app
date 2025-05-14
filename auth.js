import dotenv from "dotenv";
import express from "express";
import { getFreshSpotifyAccessToken } from "./auth-utils.js";
import SpotifyWebApi from "spotify-web-api-node";
("use strict");

dotenv.config(); // must come before using process.env

const router = express.Router();

const scopes = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-private",
  "streaming",
];

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

router.get("/login", (req, res) => {
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, "state123");
  res.redirect(authorizeURL);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    req.session.access_token = data.body.access_token;
    req.session.refresh_token = data.body.refresh_token;
    res.redirect(process.env.FRONTEND_URL);
  } catch (err) {
    console.error("Error getting Tokens:", err);
    res.status(500).send("Auth failed");
  }
});

export default router;
export { spotifyApi };

//
//

export async function ensureSpotifyToken(req, res, next) {
  try {
    await getFreshSpotifyAccessToken(req.session);
    next();
  } catch (err) {
    console.error("Token refresh error:", err);
    res.status(401).send("Unauthorized");
  }
}
