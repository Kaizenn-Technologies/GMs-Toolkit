import { useState, useEffect } from "react";
import type { RollLog } from "./types";

const STORAGE_KEY = "dm-dice-logs";

export function useDiceLogs() {
  const [logs, setLogs] = useState<RollLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const addLog = (log: RollLog) => {
    setLogs((prev) => [log, ...prev]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return { logs, addLog, clearLogs };
}
