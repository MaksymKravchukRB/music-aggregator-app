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
    const clientIdMatch = scriptText.match(
      /client_id\s*:\s*"([a-zA-Z0-9]{32})"/
    );

    if (clientIdMatch) {
      cachedClientId = clientIdMatch[1];
      console.log("Fetched SoundCloud client_id:", cachedClientId);
      return cachedClientId;
    }
  }

  throw new Error("Could not find SoundCloud client_id");
}

export async function SoundCloudSearch(query) {
  const client_id = await getClientId();
  const apiUrl = `https://api-v2.soundcloud.com/search?q=${encodeURIComponent(
    query
  )}&client_id=${client_id}&limit=5`;

  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error("SoundCloud API search failed");

  const json = await res.json();

  return json.collection
    .filter((item) => item.kind === "track")
    .map((item) => ({
      id: item.id,
      type: "track",
      title: item.title,
      artist: item.user.username,
      album: null,
      url: item.permalink_url,
      image: item.artwork_url || item.user.avatar_url,
      embed_url: `https://w.soundcloud.com/player/?url=${encodeURIComponent(
        item.permalink_url
      )}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`,
    }));
}
