import React, { useRef } from "react";

const AudioPlayer = () => {
  const audioRef = useRef();

  return (
    <audio
      ref={audioRef}
      id="audioPlayer"
      controls
      style={{ display: "block", marginTop: 20 }}
    />
  );
};

export default AudioPlayer;
