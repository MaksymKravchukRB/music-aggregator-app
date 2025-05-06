import React from "react";

const HistoryList = ({ history }) => {
  return (
    <div>
      <h2>Playback History</h2>
      <ul>
        {history.map((track, index) => (
          <li key={index}>
            {track.source.toUpperCase()}: {track.title} by {track.artist}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryList;
