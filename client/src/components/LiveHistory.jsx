import React, { useEffect, useState } from "react";
import HistoryList from "./HistoryList";

const LiveHistory = ({ refreshTrigger }) => {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  // Load on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Reload on trigger update
  useEffect(() => {
    if (refreshTrigger > 0) fetchHistory();
  }, [refreshTrigger]);

  return <HistoryList history={history} />;
};

export default LiveHistory;
