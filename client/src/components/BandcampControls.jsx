import React from "react";

const BandcampControls = ({ reloadHistory }) => {
  const playTrack = async () => {
    const url = document.getElementById("bandcampUrl").value;
    const res = await fetch(`/track/bandcamp?url=${encodeURIComponent(url)}`);
    const metadata = await res.json();

    if (metadata.audioUrl) {
      const player = document.getElementById("audioPlayer");
      player.src = metadata.audioUrl;
      player.play();
    }

    reloadHistory();
  };

  return (
    <div>
      <h2>Play Bandcamp Track</h2>
      <input id="bandcampUrl" placeholder="Bandcamp Track URL" />
      <button onClick={playTrack}>Play</button>
    </div>
  );
};

export default BandcampControls;
