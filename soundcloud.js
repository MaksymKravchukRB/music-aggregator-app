import fetch from "node-fetch";

let cachedClientId = null;

async function getClientId() {
  if (cachedClientId) return cachedClientId;

  const homepage = await fetch("https://soundcloud.com").then((r) => r.text());
  const scriptUrls = [
    ...homepage.matchAll(/<script crossorigin src="(.*?)">/g),
  ].map((m) => m[1]);

  for (const url of scriptUrls) {
    const scriptText = await fetch(url).then((r) => r.text());
    const match = scriptText.match(/client_id\s*:\s*"([a-zA-Z0-9]{32})"/);
    if (match) {
      cachedClientId = match[1];
      return cachedClientId;
    }
  }

  throw new Error("Could not extract SoundCloud client_id");
}

export async function SoundCloudSearch(query, type = "track") {
  const client_id = await getClientId();
  const apiUrl = `https://api-v2.soundcloud.com/search?q=${encodeURIComponent(
    query
  )}&client_id=${client_id}&limit=5`;
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error("SoundCloud API search failed");

  const json = await res.json();

  const filtered = json.collection.filter((item) =>
    type === "album" ? item.kind === "playlist" : item.kind === "track"
  );

  return filtered.map((item) => ({
    id: item.id,
    type: type,
    title: item.title,
    artist: item.user?.username || "Unknown Artist",
    album: type === "album" ? item.title : null,
    url: item.permalink_url,
    image: item.artwork_url || item.user?.avatar_url || null,
    embed_url: `https://w.soundcloud.com/player/?url=${encodeURIComponent(
      item.permalink_url
    )}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`,
  }));
}
