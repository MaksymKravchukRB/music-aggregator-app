import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { search } from "bandcamp-scraper";

/**
 * Search Bandcamp and return embeddable metadata
 * @param {string} query
 * @param {string} type - "track" or "album"
 */
export async function BandcampSearch(query, type = "track") {
  return new Promise((resolve, reject) => {
    search({ query, page: 1 }, async (err, results) => {
      if (err) return reject(err);

      // Filter by type (track or album)
      const filtered = results.filter((r) => r.type === type).slice(0, 5);

      // Fetch embed URL for each result
      const withEmbeds = await Promise.all(
        filtered.map(async (item) => {
          let embed_url = item.url;

          try {
            const html = await fetch(item.url).then((r) => r.text());
            const $ = cheerio.load(html);

            // Pull from the true embed tag
            const ogEmbed = $('meta[property="og:video"]').attr("content");
            if (ogEmbed) embed_url = ogEmbed;
          } catch (e) {
            console.warn(`Failed to get embed URL for ${item.url}:`, e.message);
          }

          return {
            id: item.url,
            type,
            title: item.name,
            artist: item.artist || item.bandName || "Unknown Artist",
            album: item.name,
            url: item.url,
            image: item.imageUrl,
            embed_url,
          };
        })
      );

      resolve(withEmbeds);
    });
  });
}
