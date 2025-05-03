import axios from "axios";
import * as cheerio from "cheerio";
import dbPromise from "./db.js";
//("use strict");

export async function getBandcampMetadata(trackUrl) {
  const { data: html } = await axios.get(trackUrl);
  const $ = cheerio.load(html);

  const dataAttr = $("[data-tralbum]").attr("data-tralbum");
  if (!dataAttr) throw new Error("data-tralbum attribute not found");

  let parsed;
  try {
    parsed = JSON.parse(dataAttr);
  } catch (e) {
    throw new Error("Failed to parse data-tralbum JSON");
  }

  const track = parsed.trackinfo?.[0];
  const audioUrl = track?.file?.["mp3-128"] || null;
  const title = track?.title || parsed.current?.title || "Unknown Title";
  const artist = parsed.artist || "Unknown Artist";

  return { title, artist, audioUrl };
}

export async function playBandcampTrack(trackUrl) {
  const metadata = await getBandcampMetadata(trackUrl);
  if (!metadata.audioUrl) throw new Error("No playable audio URL found");

  const db = await dbPromise;
  await db.run(
    `
    INSERT INTO tracks (source, track_id, title, artist, album, uri, preview_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    "bandcamp",
    trackUrl,
    metadata.title,
    metadata.artist,
    null,
    trackUrl,
    metadata.audioUrl
  );

  return metadata;
}
