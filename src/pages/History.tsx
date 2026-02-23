import { useState, useEffect, useRef, useCallback } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

export interface HistoryEntry {
  id: string;
  text: string;
  voice: string;
  speed: number;
  duration: number;
  audioBase64: string;
  createdAt: number;
}

const STORAGE_KEY = "catus_history";

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(ts: number): string {
  const now = new Date();
  const d = new Date(ts);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  if (d.getTime() >= todayStart) return "Today";
  if (d.getTime() >= yesterdayStart) return "Yesterday";
  return d.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
}

// ─── Mini audio player state per entry ───────────────────────────────────────
interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

export function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => loadHistory());
  const [search, setSearch] = useState("");
  const [playerMap, setPlayerMap] = useState<Record<string, PlayerState>>({});
  const [error, setError] = useState<string | null>(null);

  // Audio refs keyed by entry id
  const ctxRefs = useRef<Record<string, AudioContext>>({});
  const bufRefs = useRef<Record<string, AudioBuffer>>({});
  const srcRefs = useRef<Record<string, AudioBufferSourceNode>>({});
  const startedAtRefs = useRef<Record<string, number>>({});
  const pausedAtRefs = useRef<Record<string, number>>({});
  const rafRefs = useRef<Record<string, number>>({});

  // Sync to localStorage whenever entries change
  useEffect(() => {
    saveHistory(entries);
  }, [entries]);

  // Build filtered + grouped list
  const filtered = search.trim()
    ? entries.filter(
        (e) =>
          e.text.toLowerCase().includes(search.toLowerCase()) ||
          e.voice.toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  // Sort newest first
  const sorted = [...filtered].sort((a, b) => b.createdAt - a.createdAt);

  // Group by day label
  const groups: { label: string; items: HistoryEntry[] }[] = [];
  for (const entry of sorted) {
    const label = dayLabel(entry.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(entry);
    } else {
      groups.push({ label, items: [entry] });
    }
  }

  // ── Decode audio for an entry (lazy, on demand) ──────────────────────────
  const ensureDecoded = useCallback(async (entry: HistoryEntry): Promise<AudioBuffer | null> => {
    if (bufRefs.current[entry.id]) return bufRefs.current[entry.id];
    try {
      const binStr = atob(entry.audioBase64);
      const bytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
      const ctx = new AudioContext();
      ctxRefs.current[entry.id] = ctx;
      const buf = await ctx.decodeAudioData(bytes.buffer);
      bufRefs.current[entry.id] = buf;
      return buf;
    } catch {
      return null;
    }
  }, []);

  // ── Tick RAF for a playing entry ─────────────────────────────────────────
  const tick = useCallback((id: string, duration: number) => {
    const ctx = ctxRefs.current[id];
    if (!ctx) return;
    const elapsed = ctx.currentTime - (startedAtRefs.current[id] ?? 0) + (pausedAtRefs.current[id] ?? 0);
    const t = Math.min(elapsed, duration);
    setPlayerMap((prev) => ({ ...prev, [id]: { ...prev[id], currentTime: t } }));
    if (elapsed < duration) {
      rafRefs.current[id] = requestAnimationFrame(() => tick(id, duration));
    } else {
      setPlayerMap((prev) => ({ ...prev, [id]: { isPlaying: false, currentTime: duration, duration } }));
      cancelAnimationFrame(rafRefs.current[id]);
    }
  }, []);

  // ── Stop a specific player ───────────────────────────────────────────────
  const stopPlayer = useCallback((id: string) => {
    if (srcRefs.current[id]) {
      try { srcRefs.current[id].stop(); } catch {}
      delete srcRefs.current[id];
    }
    cancelAnimationFrame(rafRefs.current[id]);
  }, []);

  // ── Play / Pause toggle ──────────────────────────────────────────────────
  const handlePlayPause = useCallback(async (entry: HistoryEntry) => {
    const id = entry.id;
    const state = playerMap[id];
    const duration = entry.duration;

    const buf = await ensureDecoded(entry);
    if (!buf) return;

    if (state?.isPlaying) {
      // Pause
      const ctx = ctxRefs.current[id];
      const elapsed = (ctx?.currentTime ?? 0) - (startedAtRefs.current[id] ?? 0) + (pausedAtRefs.current[id] ?? 0);
      pausedAtRefs.current[id] = Math.min(elapsed, duration);
      stopPlayer(id);
      setPlayerMap((prev) => ({ ...prev, [id]: { ...prev[id], isPlaying: false } }));
      return;
    }

    // Stop any currently playing entry
    for (const otherId of Object.keys(srcRefs.current)) {
      if (otherId !== id) {
        stopPlayer(otherId);
        setPlayerMap((prev) => ({
          ...prev,
          [otherId]: { ...(prev[otherId] ?? {}), isPlaying: false },
        }));
      }
    }

    // Create / reuse AudioContext
    if (!ctxRefs.current[id] || ctxRefs.current[id].state === "closed") {
      ctxRefs.current[id] = new AudioContext();
    }
    const ctx = ctxRefs.current[id];
    if (ctx.state === "suspended") await ctx.resume();

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    const resumeFrom = pausedAtRefs.current[id] ?? 0;
    src.onended = () => {
      setPlayerMap((prev) => ({ ...prev, [id]: { isPlaying: false, currentTime: duration, duration } }));
      delete srcRefs.current[id];
    };
    src.start(0, resumeFrom);
    srcRefs.current[id] = src;
    startedAtRefs.current[id] = ctx.currentTime;

    setPlayerMap((prev) => ({ ...prev, [id]: { isPlaying: true, currentTime: resumeFrom, duration } }));
    requestAnimationFrame(() => tick(id, duration));
  }, [playerMap, ensureDecoded, stopPlayer, tick]);

  // ── Delete entry ─────────────────────────────────────────────────────────
  const handleDelete = useCallback((id: string) => {
    stopPlayer(id);
    delete ctxRefs.current[id];
    delete bufRefs.current[id];
    delete pausedAtRefs.current[id];
    delete startedAtRefs.current[id];
    setPlayerMap((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, [stopPlayer]);

  // ── Download entry ────────────────────────────────────────────────────────
  const handleDownload = useCallback(async (entry: HistoryEntry) => {
    try {
      const path = await save({
        defaultPath: `catus-${entry.voice.toLowerCase()}-${entry.id.slice(0, 6)}.wav`,
        filters: [{ name: "WAV Audio", extensions: ["wav"] }],
      });
      if (path) {
        await invoke("save_audio", { audioBase64: entry.audioBase64, outputPath: path });
      }
    } catch (e) {
      setError(`Save failed: ${e}`);
    }
  }, []);

  // ── Clear all history ─────────────────────────────────────────────────────
  const handleClearAll = useCallback(() => {
    for (const id of Object.keys(srcRefs.current)) stopPlayer(id);
    ctxRefs.current = {};
    bufRefs.current = {};
    srcRefs.current = {};
    pausedAtRefs.current = {};
    startedAtRefs.current = {};
    setPlayerMap({});
    setEntries([]);
  }, [stopPlayer]);

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-[-50px] left-[200px] w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none" />

      <header className="px-8 py-6 flex justify-between items-center bg-transparent z-10 flex-shrink-0">
        <div>
          <h1 className="font-display font-bold text-3xl text-text">Generation History</h1>
          <p className="text-text-muted text-sm font-medium">
            {entries.length} generation{entries.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted pointer-events-none">
              <span className="material-symbols-outlined text-xl">search</span>
            </span>
            <input
              className="pl-10 pr-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-text focus:outline-none focus:border-primary w-64 shadow-button-depth-secondary transition-all"
              placeholder="Search by text or voice…"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {entries.length > 0 && (
            <button
              className="bg-white text-red-500 border-2 border-red-200 px-4 py-2 rounded-xl font-bold shadow-button-depth-secondary squishy-btn flex items-center gap-2 hover:bg-red-50"
              onClick={handleClearAll}
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              Clear All
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="mx-8 mb-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
          <button className="ml-auto text-red-400 hover:text-red-600" onClick={() => setError(null)}>
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      <div className="flex-1 px-8 pb-8 overflow-y-auto z-10">
        <div className="max-w-5xl mx-auto space-y-6">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-text-muted gap-4">
              <span className="material-symbols-outlined text-6xl text-gray-200">history</span>
              <p className="font-bold text-lg text-gray-400">
                {search ? "No results found" : "No generations yet"}
              </p>
              <p className="text-sm">
                {search ? "Try a different search term" : "Generate speech in Studio to see it here"}
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 pl-2">
                  {group.label}
                </h3>
                <div className="space-y-4">
                  {group.items.map((entry) => {
                    const state = playerMap[entry.id];
                    const isPlaying = state?.isPlaying ?? false;
                    const currentTime = state?.currentTime ?? 0;
                    const duration = entry.duration;
                    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
                    return (
                      <HistoryItem
                        key={entry.id}
                        entry={entry}
                        isPlaying={isPlaying}
                        currentTime={currentTime}
                        progress={progress}
                        time={formatClock(entry.createdAt)}
                        onPlayPause={() => handlePlayPause(entry)}
                        onDelete={() => handleDelete(entry.id)}
                        onDownload={() => handleDownload(entry)}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

interface HistoryItemProps {
  entry: HistoryEntry;
  isPlaying: boolean;
  currentTime: number;
  progress: number;
  time: string;
  onPlayPause: () => void;
  onDelete: () => void;
  onDownload: () => void;
}

function HistoryItem({
  entry,
  isPlaying,
  currentTime,
  progress,
  time,
  onPlayPause,
  onDelete,
  onDownload,
}: HistoryItemProps) {
  function fmtTime(secs: number): string {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  const truncated = entry.text.length > 80 ? entry.text.slice(0, 80) + "…" : entry.text;

  return (
    <div className="bg-surface rounded-2xl p-4 shadow-neostyle border border-white hover:shadow-neostyle-hover hover:translate-y-[2px] transition-all duration-200 flex items-center gap-4 group">
      <button
        className="w-12 h-12 rounded-full bg-orange-50 text-primary hover:bg-primary hover:text-white flex items-center justify-center shadow-sm border-2 border-orange-100 transition-colors flex-shrink-0"
        onClick={onPlayPause}
      >
        <span className="material-symbols-outlined text-2xl ml-0.5">
          {isPlaying ? "pause" : "play_arrow"}
        </span>
      </button>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-text text-base truncate mb-1">{truncated}</h4>
        <div className="flex items-center gap-3 text-sm text-text-muted mb-2">
          <span className="font-medium">{entry.voice}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>{entry.speed.toFixed(1)}x</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">schedule</span>
            <span>{fmtTime(entry.duration)}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>{time}</span>
        </div>

        {/* Mini progress bar (only when there's progress or playing) */}
        {progress > 0 && (
          <div className="relative w-full h-1 bg-gray-100 rounded-full">
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {progress > 0 && (
          <div className="text-xs font-mono text-text-muted mt-1">
            {fmtTime(currentTime)} / {fmtTime(entry.duration)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-2 hover:bg-orange-50 hover:text-primary text-text-muted rounded-xl transition-colors"
          title="Download"
          onClick={onDownload}
        >
          <span className="material-symbols-outlined">download</span>
        </button>
        <button
          className="p-2 hover:bg-red-50 hover:text-red-500 text-text-muted rounded-xl transition-colors"
          title="Delete"
          onClick={onDelete}
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  );
}
