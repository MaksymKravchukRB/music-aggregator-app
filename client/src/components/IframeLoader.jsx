import React, { useEffect } from "react";

const IframeLoader = ({ embed_url, metadata = null }) => {
  useEffect(() => {
    if (!embed_url || !metadata) return;

    const logPlayback = async () => {
      const { source, track_id, title, artist, album, uri, preview_url } =
        metadata;

      const res = await fetch("/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          iframe_code: embed_url,
          source,
          track_id,
          title,
          artist,
          album,
          uri,
          preview_url,
        }),
      });

      if (!res.ok) console.error("Failed to log track history");
    };

    logPlayback();
  }, [embed_url, metadata]);

  if (!embed_url) return null;

  if (embed_url.includes("spotify")) {
    return (
      <iframe
        style={{ borderRadius: "12px" }}
        src={embed_url}
        width="100%"
        height="352"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    );
  }

  if (embed_url.includes("soundcloud")) {
    return (
      <iframe
        width="100%"
        height="300"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={embed_url}
      ></iframe>
    );
  }

  if (embed_url.includes("bandcamp")) {
    return (
      <iframe
        style={{ border: 0, width: "100%", height: "120px" }}
        src={embed_url}
        seamless
      ></iframe>
    );
  }

  return null;
};

export default IframeLoader;
