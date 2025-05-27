import React, { useEffect, useState, useRef } from "react";
import AddToPlaylistButton from "./AddToPlaylistButton";

const IframeLoader = () => {
  const [embedUrl, setEmbedUrl] = useState("");
  const [metadata, setMetadata] = useState(null);
  const lastPlayedRef = useRef(null);

  // Listen to playTrack event
  useEffect(() => {
    const handler = (e) => {
      const { embed_url, metadata } = e.detail;
      setEmbedUrl(embed_url);
      setMetadata(metadata);
    };

    window.addEventListener("playTrack", handler);
    return () => window.removeEventListener("playTrack", handler);
  }, []);

  // Trigger playback logging
  useEffect(() => {
    if (!embedUrl || !metadata) return;

    const currentId = metadata.track_id;
    if (lastPlayedRef.current === currentId) return;
    lastPlayedRef.current = currentId;

    const notifyPlayback = async () => {
      try {
        const res = await fetch("/playback/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            iframe_code: embedUrl,
            ...metadata,
          }),
        });

        if (res.ok) {
          window.dispatchEvent(new Event("history:refresh"));
        } else {
          console.error("Failed to log playback");
        }
      } catch (err) {
        console.error("Logging error:", err.message);
      }
    };

    notifyPlayback();
  }, [embedUrl, metadata]);

  if (!embedUrl) return null;

  return (
    <div>
      {embedUrl.includes("spotify") && (
        <iframe
          style={{ borderRadius: "12px" }}
          src={embedUrl}
          width="100%"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      )}

      {embedUrl.includes("soundcloud") && (
        <iframe
          width="100%"
          height="300"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={embedUrl}
        ></iframe>
      )}

      {embedUrl.includes("bandcamp") && (
        <iframe
          style={{ border: 0, width: "100%", height: "120px" }}
          src={embedUrl}
          seamless
        ></iframe>
      )}

      {metadata && <AddToPlaylistButton track={metadata} embedUrl={embedUrl} />}
    </div>
  );
};

export default IframeLoader;
