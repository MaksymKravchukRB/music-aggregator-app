export const logHistoryEntry = async ({
  iframe_code,
  source,
  track_id,
  title,
  artist,
  album,
  uri,
  preview_url,
}) => {
  try {
    const res = await fetch("/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        iframe_code,
        source,
        track_id,
        title,
        artist,
        album,
        uri,
        preview_url,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to log history: ${error}`);
    }
  } catch (err) {
    console.error("[logHistoryEntry] Error:", err.message);
  }
};
