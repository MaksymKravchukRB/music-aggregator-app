import express from "express";
import dotenv from "dotenv";
import cookieSession from "cookie-session";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes, { ensureSpotifyToken } from "./auth.js";
import { initDb } from "./db.js";
import { playSpotifyTrack } from "./spotify.js";
import { playBandcampTrack } from "./bandcamp.js";
import { getPlaybackHistory, clearPlaybackHistory } from "./history.js";
import {
  createPlaylist,
  addTrackToPlaylist,
  getPlaylist,
} from "./playlists.js";

("use strict");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8888;

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

// Init DB
await initDb();

// Auth routes
app.use(authRoutes);

// API endpoints
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
    res.json(data);
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

// === Serve React frontend in production ===
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.resolve(__dirname, "client", "build");
  app.use(express.static(clientBuildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
