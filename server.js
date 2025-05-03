import express from "express";
import dotenv from "dotenv";
import cookieSession from "cookie-session";
import authRoutes from "./auth.js";
import { initDb } from "./db.js";
//("use strict");

dotenv.config();

const app = express();
const PORT = 8888;

app.use(express.json());
app.use(express.static("public"));
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

await initDb();

app.use(authRoutes);

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./public" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

//
//

import { ensureSpotifyToken } from "./auth.js";
import { playSpotifyTrack } from "./spotify.js";
import { playBandcampTrack } from "./bandcamp.js";
import { getPlaybackHistory, clearPlaybackHistory } from "./history.js";
import {
  createPlaylist,
  addTrackToPlaylist,
  getPlaylist,
  ClearHistory,
} from "./playlists.js";

app.get("/track/spotify/:id", ensureSpotifyToken, async (req, res) => {
  try {
    const data = await playSpotifyTrack(req.session, req.params.id);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/track/bandcamp", async (req, res) => {
  try {
    const data = await playBandcampTrack(req.query.url);
    res.json(data); // includes audioUrl
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/history", async (req, res) => {
  const history = await getPlaybackHistory();
  res.json(history);
});

app.delete("/history", async (req, res) => {
  try {
    await clearPlaybackHistory();
    res.status(200).json({ message: "Playback history cleared" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/playlist", async (req, res) => {
  await createPlaylist(req.body.name);
  res.sendStatus(201);
});

app.post("/playlist/:name/add", async (req, res) => {
  try {
    await addTrackToPlaylist(req.params.name, req.body.track_id);
    res.sendStatus(200);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/playlist/:name", async (req, res) => {
  const tracks = await getPlaylist(req.params.name);
  res.json(tracks);
});

app.post("/playlist/clearhistory", async (req, res) => {
  try {
    await ClearHistory();
    res.sendStatus(200);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
