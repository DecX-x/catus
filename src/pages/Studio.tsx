import { useState, useEffect, useRef, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import type { HistoryEntry } from "./History";

// ─── Voice metadata (names match AVAILABLE_VOICES in tts.rs exactly) ────────
const VOICES = [
  {
    name: "Jasper",
    gender: "M",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKxgTr8x9NrgmJXKyDxpXusqx8rALJU--XWvujVacl9bcMjwIVZxJY0Gf3asel6OxCui49tvruisprwIuLuL8Jepyj4HZwfPeFBuVALI973nJd3P0I9XUoxX4rK8yc4R-NS7at1h65Xcz-PoeGEi7uAftZqqQ-TUM13O_vSSgsexbX-Zcw3cE5fHxhq7110CCK6XJmx9Hrae72omG84ckSYAcLOXtJl6vCdwQpcHyXMM9sw8kIO0v13U4raCl1qyGtdIyCEqslrlo",
  },
  {
    name: "Bella",
    gender: "F",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKpMmSt-dCR_0XaIy4CMWrkvJfoA6U3B4y4M7TXxnKTnhf8eIgzinkvObbNHeSjVXML5aWug9-w4a0wUN7Up_eDwyEOtyh5oQnEqqpN4GyHikMchoG-YTdCCUy1Zx5RIeFhXb-AXqz86ckln_CYELKrTM_kaiRgXWYtfq0RgSn6DTRzriki7qfYLHux8Mum9bIU3tH3weekmajFrOR-gQJcHzdQ8Q_DhsmDtrQpu2G7duwFCpqAEfCuQ45leK5nNBMl1s2Yehp_WA",
  },
  {
    name: "Luna",
    gender: "F",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnSItD67jYd77LMgObiD3Y1rgBBkY-J6M2SD_mXhUuTFfa2uaKo7a3evvfkIw_DoF4yNVqcVqKUPhkGuGCkjY_Kw7DtxLKEqwMDZkEQKQkEjFOdn4qQ_XTMxJveqFppJ4UlUkt6TU_zE9zrK3jHv6fAzr7AoXCGmV5815q9M94oNUeH68wYsSZrKG_j8sJ3rW0shbWaeswMpOo7ueZOtJzFDqvbVbJ1ixry59DmCBZQM-jxoCjYEqNMTjdo6_7Dsqm24XWmBo6Hww",
  },
  {
    name: "Bruno",
    gender: "M",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_h5nHdjO6oQBpdz5WNos427DlPUKqbpfbKZBc6lwcr4BXI8MWVdaUgzqSsCAkIbCriSmSH5z3xuX7H6ySRtlY5SpB19OnBvdN8IRMHN567yeYtkcvw8OH8YamWjc1F1AHx2QOFSg9boPDc9nQjrmzpkC8t5wF9pX-qbUpKhCKjHozei_HY2stt1qhv4t-61UG8IXuQkLSF_XnxFTRcFFp58JHx446ZkSbKdHeO6FbuLi4waFAyubXJ9pD1CKfOXUbQgFP89DkFpc",
  },
  {
    name: "Rosie",
    gender: "F",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuByt7ad4SLQBCFWfo-CSdcT4Qn9uiQr2kTmSoUHiz-E19af6m0ymOW0YvWXMlfSXIRsBysepgg4veq0sQ1ArcpikFMQI9L0ajfGr2czT6jhzYsr1jnx-k_v9YTogzsBXVTNUiTZTt3kenWqrPIkbvlpQa3E7ZEhz6m3C8w4rNUiEDx3RGBDeaQpn4B31ttA9HMKam1NGLHraRX32C6UZQs5co5xMC5Iu0tZB1lPo9ilMokuIKSJx0cb9WpyFmGSfeSvf5Wgqdx-Lug",
  },
  {
    name: "Hugo",
    gender: "M",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUk8L1WY0h2m-x4KaiNixzozMc3ZJMX_x8vGo0MJ3mT-RiiBr0oabcWBz23mgMavDbRkh9mZz4SewPuMZ2YIg1ddpUFJmRz1a4Rsub18SjB6MN32Exw6gkwCsXHX2kNzUfNc_5FhB9DOZ5bOZ3T3WVllTLzr3AUipadndedlW7E9qCwUWI7gFidPGI81qymroQHwNTdGddeleOY4FRLSpYaRgqilYmdwTRP3gS5RBMYlkS6PdjzfLgDNQr7lUmSAR2qpO_RHtvv8k",
  },
  {
    name: "Kiki",
    gender: "F",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsOzKSipgVkf3A9Y5tCPIoK_hiUQQ48uIMv-Z9Zzv4i1hHerLMBpSPVrnOhL5N3BNO5d_BbXst-r33CzIcp732bVf33adwEANK0XeedaTsazMN9_3nJie8oX2fj4xzHle6vfAy_ceyqD1Nv4gHkggwKGaW24fZharLEVvw6I7WErF_ymDt4FgIdXOoJq_Rk0WG3B54Aktt41MyMiWACAuRIf1vFe0lhQTtbL9ypHigHjSAZ05sZWfC4E1z1ilJRRvGoqaBC_2kBGQ",
  },
  {
    name: "Leo",
    gender: "M",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_h5nHdjO6oQBpdz5WNos427DlPUKqbpfbKZBc6lwcr4BXI8MWVdaUgzqSsCAkIbCriSmSH5z3xuX7H6ySRtlY5SpB19OnBvdN8IRMHN567yeYtkcvw8OH8YamWjc1F1AHx2QOFSg9boPDc9nQjrmzpkC8t5wF9pX-qbUpKhCKjHozei_HY2stt1qhv4t-61UG8IXuQkLSF_XnxFTRcFFp58JHx446ZkSbKdHeO6FbuLi4waFAyubXJ9pD1CKfOXUbQgFP89DkFpc",
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────
interface GenerateResult {
  audio_base64: string;
  duration_secs: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtTime(secs: number): string {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(secs % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

/** Decode a base64 WAV string and return an AudioBuffer via Web Audio API */
async function decodeWavBase64(b64: string): Promise<AudioBuffer> {
  const binStr = atob(b64);
  const bytes = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
  const ctx = new AudioContext();
  return ctx.decodeAudioData(bytes.buffer);
}

// ─── History helpers ─────────────────────────────────────────────────────────
const HISTORY_KEY = "catus_history";

function pushHistoryEntry(entry: HistoryEntry) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list: HistoryEntry[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry); // newest first
    // Cap at 200 entries to avoid unbounded localStorage growth
    if (list.length > 200) list.length = 200;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {}
}

// ─── Component ───────────────────────────────────────────────────────────────
interface StudioProps {
  defaultVoice?: string;
}

export function Studio({ defaultVoice = "Jasper" }: StudioProps) {
  const [text, setText] = useState(
    "The quick brown fox jumps over the lazy dog. But in this digital age, the fox prefers to stream his adventures in 4K resolution while the dog blogs about sustainable bone burying practices."
  );
  const [selectedVoice, setSelectedVoice] = useState(defaultVoice);
  const [speed, setSpeed] = useState(1.0);
  const [stabilityBoost, setStabilityBoost] = useState(true);

  // TTS state
  const [isGenerating, setIsGenerating] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio playback state
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Web Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startedAtRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  // ── Init TTS engine on mount ──────────────────────────────────────────────
  useEffect(() => {
    invoke<string>("init_tts")
      .then(() => setEngineReady(true))
      .catch((e) => setError(`Engine init failed: ${e}`));
  }, []);

  // ── Playback tick ─────────────────────────────────────────────────────────
  const tickPlayback = useCallback(() => {
    if (!audioCtxRef.current || !isPlaying) return;
    const elapsed = audioCtxRef.current.currentTime - startedAtRef.current + pausedAtRef.current;
    setCurrentTime(Math.min(elapsed, audioDuration));
    if (elapsed < audioDuration) {
      rafRef.current = requestAnimationFrame(tickPlayback);
    } else {
      setIsPlaying(false);
      setCurrentTime(audioDuration);
      cancelAnimationFrame(rafRef.current);
    }
  }, [isPlaying, audioDuration]);

  useEffect(() => {
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(tickPlayback);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, tickPlayback]);

  // ── Stop helper ───────────────────────────────────────────────────────────
  const stopPlayback = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {}
      sourceRef.current = null;
    }
    cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Play / Pause toggle ───────────────────────────────────────────────────
  const handlePlayPause = useCallback(async () => {
    if (!audioBufferRef.current) return;

    if (isPlaying) {
      // Pause: record how far we got
      const elapsed =
        (audioCtxRef.current?.currentTime ?? 0) - startedAtRef.current + pausedAtRef.current;
      pausedAtRef.current = Math.min(elapsed, audioDuration);
      stopPlayback();
      setIsPlaying(false);
      return;
    }

    // Resume / Start
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }

    const src = audioCtxRef.current.createBufferSource();
    src.buffer = audioBufferRef.current;
    src.connect(audioCtxRef.current.destination);
    src.onended = () => {
      setIsPlaying(false);
      setCurrentTime(audioDuration);
      sourceRef.current = null;
    };
    src.start(0, pausedAtRef.current);
    sourceRef.current = src;
    startedAtRef.current = audioCtxRef.current.currentTime;
    setIsPlaying(true);
  }, [isPlaying, audioDuration, stopPlayback]);

  // ── Generate speech ───────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!engineReady || isGenerating || !text.trim()) return;
    setError(null);
    setIsGenerating(true);
    stopPlayback();
    setIsPlaying(false);
    setCurrentTime(0);
    pausedAtRef.current = 0;
    setAudioBase64(null);
    audioBufferRef.current = null;

    try {
      const result = await invoke<GenerateResult>("generate_speech", {
        text: text.trim(),
        voice: selectedVoice,
        speed,
      });

      setAudioBase64(result.audio_base64);
      setAudioDuration(result.duration_secs);

      // Decode into AudioBuffer
      const buf = await decodeWavBase64(result.audio_base64);
      audioCtxRef.current = new AudioContext();
      audioBufferRef.current = buf;

      // Persist to history
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text: text.trim(),
        voice: selectedVoice,
        speed,
        duration: result.duration_secs,
        audioBase64: result.audio_base64,
        createdAt: Date.now(),
      };
      pushHistoryEntry(entry);
    } catch (e) {
      setError(`Generation failed: ${e}`);
    } finally {
      setIsGenerating(false);
    }
  }, [engineReady, isGenerating, text, selectedVoice, speed, stopPlayback]);

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    if (!audioBase64) return;
    try {
      // Use tauri-plugin-fs save dialog
      const path = await save({
        defaultPath: `catus-${selectedVoice.toLowerCase()}.wav`,
        filters: [{ name: "WAV Audio", extensions: ["wav"] }],
      });
      if (path) {
        await invoke("save_audio", { audioBase64, outputPath: path });
      }
    } catch (e) {
      setError(`Save failed: ${e}`);
    }
  }, [audioBase64, selectedVoice]);

  // ── Seekbar click ─────────────────────────────────────────────────────────
  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!audioDuration || !audioBufferRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const seekTo = ratio * audioDuration;

      if (isPlaying) {
        stopPlayback();
        pausedAtRef.current = seekTo;
        setCurrentTime(seekTo);
        // Restart from new position
        if (audioCtxRef.current && audioBufferRef.current) {
          const src = audioCtxRef.current.createBufferSource();
          src.buffer = audioBufferRef.current;
          src.connect(audioCtxRef.current.destination);
          src.onended = () => {
            setIsPlaying(false);
            setCurrentTime(audioDuration);
            sourceRef.current = null;
          };
          src.start(0, seekTo);
          sourceRef.current = src;
          startedAtRef.current = audioCtxRef.current.currentTime;
        }
      } else {
        pausedAtRef.current = seekTo;
        setCurrentTime(seekTo);
      }
    },
    [isPlaying, audioDuration, stopPlayback]
  );

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;
  const hasAudio = audioBufferRef.current !== null;

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
      {/* Ambient blobs */}
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-[-50px] left-[200px] w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center bg-transparent z-10">
        <div>
          <h1 className="font-display font-bold text-3xl text-text">Studio</h1>
          <p className="text-text-muted text-sm font-medium flex items-center gap-1">
            {engineReady ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                Engine ready
              </>
            ) : error ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
                Engine error
              </>
            ) : (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                Loading engine…
              </>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="bg-white text-text border-2 border-gray-200 px-4 py-2 rounded-xl font-bold shadow-button-depth-secondary squishy-btn flex items-center gap-2 hover:bg-gray-50"
            onClick={async () => {
              try {
                const t = await navigator.clipboard.readText();
                setText(t);
              } catch {}
            }}
          >
            <span className="material-symbols-outlined text-sm">content_paste</span>
            Paste
          </button>
          <button className="bg-white text-text border-2 border-gray-200 px-4 py-2 rounded-xl font-bold shadow-button-depth-secondary squishy-btn flex items-center gap-2 hover:bg-gray-50">
            <span className="material-symbols-outlined text-sm">save</span>
            Save
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="mx-8 mb-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
          <button className="ml-auto text-red-400 hover:text-red-600" onClick={() => setError(null)}>
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Main layout */}
      <div className="flex-1 px-8 pb-8 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Left: text area + player */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Text area */}
          <div className="bg-surface rounded-3xl p-1 shadow-neostyle border-2 border-white flex-1 flex flex-col relative group">
            <div className="absolute top-4 right-4 flex gap-2 z-10 opacity-50 group-hover:opacity-100 transition-opacity">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg text-text-muted transition-colors"
                title="Clear"
                onClick={() => setText("")}
              >
                <span className="material-symbols-outlined text-lg">delete_sweep</span>
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg text-text-muted transition-colors"
                title="Paste"
                onClick={async () => {
                  try {
                    const t = await navigator.clipboard.readText();
                    setText((prev) => prev + t);
                  } catch {}
                }}
              >
                <span className="material-symbols-outlined text-lg">content_paste</span>
              </button>
            </div>
            <textarea
              className="w-full h-full p-6 bg-gray-50/50 rounded-[1.3rem] border-none focus:ring-0 resize-none text-lg text-text placeholder-gray-400 font-medium leading-relaxed shadow-inner-depth outline-none"
              placeholder="Type or paste your text here to convert to speech…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={5000}
            />
            <div className="absolute bottom-4 right-6 text-xs font-bold text-text-muted bg-white/80 px-3 py-1 rounded-full border border-gray-100 shadow-sm">
              {text.length} / 5000 chars
            </div>
          </div>

          {/* Player bar */}
          <div
            className={`bg-surface rounded-2xl p-4 shadow-neostyle border border-orange-100 flex items-center gap-4 ${
              isPlaying ? "playing" : ""
            }`}
          >
            {/* Play / Pause */}
            <button
              className={`w-12 h-12 rounded-full text-white flex items-center justify-center shadow-button-depth squishy-btn flex-shrink-0 transition-colors ${
                hasAudio ? "bg-primary hover:bg-primaryDark" : "bg-gray-300 cursor-not-allowed"
              }`}
              onClick={handlePlayPause}
              disabled={!hasAudio}
            >
              <span className="material-symbols-outlined text-2xl">
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>

            {/* Seekbar / waveform */}
            <div
              className="flex-1 flex flex-col justify-center gap-1 cursor-pointer select-none"
              onClick={handleSeek}
            >
              {/* Animated waveform bars */}
              <div className="flex items-center gap-[3px] h-10 px-1">
                {[...Array(32)].map((_, i) => {
                  const active = hasAudio && progress > (i / 32) * 100;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all ${
                        active ? "bg-primary" : "bg-orange-200"
                      } ${isPlaying ? "wave-bar" : ""}`}
                      style={{
                        height: isPlaying
                          ? undefined
                          : `${20 + Math.sin(i * 0.8) * 14}%`,
                        animationDelay: isPlaying ? `${(i % 6) * 0.08}s` : undefined,
                      }}
                    />
                  );
                })}
              </div>

              {/* Progress track */}
              <div className="relative w-full h-1 bg-gray-100 rounded-full">
                <div
                  className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Time */}
            <div className="text-xs font-mono font-bold text-text-muted whitespace-nowrap">
              {fmtTime(currentTime)} / {fmtTime(audioDuration)}
            </div>

            <div className="h-8 w-[1px] bg-gray-200 mx-1" />

            {/* Download */}
            <button
              className={`p-2 rounded-full transition-colors ${
                hasAudio ? "hover:bg-gray-100 text-text" : "text-gray-300 cursor-not-allowed"
              }`}
              title="Download WAV"
              onClick={handleDownload}
              disabled={!hasAudio}
            >
              <span className="material-symbols-outlined">download</span>
            </button>
          </div>
        </div>

        {/* Right: controls panel */}
        <div className="w-full lg:w-96 flex flex-col gap-5 overflow-y-auto pr-1 pb-4">
          {/* Generate button */}
          <button
            className={`w-full py-4 rounded-2xl font-display font-bold text-xl shadow-button-depth squishy-btn flex items-center justify-center gap-2 group transition-colors ${
              engineReady && !isGenerating && text.trim()
                ? "bg-primary hover:bg-primaryDark text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            onClick={handleGenerate}
            disabled={!engineReady || isGenerating || !text.trim()}
          >
            <span
              className={`material-symbols-outlined text-3xl ${
                isGenerating ? "animate-spin" : "group-hover:animate-spin"
              }`}
            >
              {isGenerating ? "progress_activity" : "autorenew"}
            </span>
            {isGenerating ? "Generating…" : "Generate Speech"}
          </button>

          {/* Voice selection */}
          <div className="bg-surface p-6 rounded-3xl shadow-neostyle border border-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-text flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">record_voice_over</span>
                Voice
              </h2>
              <span className="text-xs font-bold text-primary bg-orange-50 px-2 py-1 rounded">
                {VOICES.length} voices
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {VOICES.map((v) => {
                const active = selectedVoice === v.name;
                return (
                  <div
                    key={v.name}
                    className="flex flex-col items-center gap-1 cursor-pointer group"
                    onClick={() => setSelectedVoice(v.name)}
                  >
                    <div
                      className={`w-14 h-14 rounded-full border-2 overflow-hidden transition-all relative ${
                        active
                          ? "border-primary shadow-button-depth scale-105"
                          : "border-transparent hover:border-orange-200 voice-avatar"
                      }`}
                    >
                      <img
                        alt={v.name}
                        src={v.img}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${v.name}&background=FF8C42&color=fff&size=56`;
                        }}
                      />
                      {active && (
                        <div className="absolute inset-0 bg-primary/10 flex items-end justify-center pb-1">
                          <span className="material-symbols-outlined text-primary text-sm drop-shadow">
                            check_circle
                          </span>
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        active ? "text-primary font-bold" : "text-text-muted group-hover:text-text"
                      }`}
                    >
                      {v.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Parameters */}
          <div className="bg-surface p-6 rounded-3xl shadow-neostyle border border-white flex flex-col gap-5">
            <h2 className="font-bold text-lg text-text flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">tune</span>
              Parameters
            </h2>

            {/* Speed slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-text-muted">Speed</label>
                <span className="text-sm font-bold text-primary">{speed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.05}
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary bg-gray-100"
              />
              <div className="flex justify-between mt-1 text-xs text-gray-400 font-medium">
                <span>0.5x</span>
                <span>1x</span>
                <span>2x</span>
              </div>
            </div>

            {/* Stability Boost toggle */}
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <span className="text-sm font-bold text-text-muted block">Stability Boost</span>
                <span className="text-xs text-gray-400">Reduce artifacts in long text</span>
              </div>
              <button
                onClick={() => setStabilityBoost((v) => !v)}
                className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${
                  stabilityBoost ? "bg-primary" : "bg-gray-200"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${
                    stabilityBoost ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Format picker (WAV only for now) */}
          <div className="bg-surface p-4 rounded-2xl shadow-neostyle border border-white flex gap-2">
            <button className="flex-1 py-2 text-sm font-bold text-white bg-text rounded-xl shadow-md">
              .WAV
            </button>
            <button
              className="flex-1 py-2 text-sm font-bold text-text-muted hover:bg-gray-50 rounded-xl transition-colors opacity-40 cursor-not-allowed"
              disabled
              title="Coming soon"
            >
              .MP3
            </button>
            <button
              className="flex-1 py-2 text-sm font-bold text-text-muted hover:bg-gray-50 rounded-xl transition-colors opacity-40 cursor-not-allowed"
              disabled
              title="Coming soon"
            >
              .OGG
            </button>
          </div>

          {/* Audio info */}
          {hasAudio && (
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl text-sm text-text-muted flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">audio_file</span>
              <div>
                <div className="font-bold text-text">{selectedVoice} · WAV · 24kHz</div>
                <div>Duration: {fmtTime(audioDuration)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
