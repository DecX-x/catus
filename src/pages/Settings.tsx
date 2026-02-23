import { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";

export interface AppSettings {
  defaultVoice: string;
  outputDir: string;
}

const STORAGE_KEY = "catus_settings";
const VOICES = ["Jasper", "Bella", "Luna", "Bruno", "Rosie", "Hugo", "Kiki", "Leo"];
const VOICE_DESC: Record<string, string> = {
  Jasper: "Male, Deep",
  Bella: "Female, Soft",
  Luna: "Female, Energetic",
  Bruno: "Male, Warm",
  Rosie: "Female, Bright",
  Hugo: "Male, Calm",
  Kiki: "Female, Playful",
  Leo: "Male, Neutral",
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppSettings;
  } catch {}
  return { defaultVoice: "Jasper", outputDir: "" };
}

export function Settings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [saved, setSaved] = useState(false);

  // Keep saved indicator in sync on mount
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  function handleBrowse() {
    open({ directory: true, multiple: false, title: "Choose output directory" })
      .then((result) => {
        if (typeof result === "string") {
          setSettings((s) => ({ ...s, outputDir: result }));
        }
      })
      .catch(() => {});
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    const defaults: AppSettings = { defaultVoice: "Jasper", outputDir: "" };
    setSettings(defaults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="flex-1 w-full flex flex-col h-screen overflow-hidden relative">
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-[-50px] left-[200px] w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none" />

      <header className="px-8 py-6 flex justify-between items-center bg-transparent z-10 flex-shrink-0">
        <div>
          <h1 className="font-display font-bold text-3xl text-text">Settings</h1>
          <p className="text-text-muted text-sm font-medium">Manage application preferences.</p>
        </div>
        <div className="flex gap-3">
          <button
            className="bg-white text-text border-2 border-gray-200 px-4 py-2 rounded-xl font-bold shadow-button-depth-secondary squishy-btn flex items-center gap-2 hover:bg-gray-50"
            onClick={handleReset}
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            Reset Defaults
          </button>
          <button
            className={`border-2 px-4 py-2 rounded-xl font-bold shadow-button-depth squishy-btn flex items-center gap-2 transition-colors ${
              saved
                ? "bg-green-500 border-green-500 text-white"
                : "bg-primary border-primary text-white hover:bg-primaryDark"
            }`}
            onClick={handleSave}
          >
            <span className="material-symbols-outlined text-sm">
              {saved ? "check" : "save"}
            </span>
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </header>

      <div className="flex-1 px-8 pb-8 overflow-y-auto z-10">
        <div className="flex flex-col gap-6 h-full">

          {/* Top row — Output Directory + About stacked left, Default Voice fills right */}
          <div className="flex gap-6 flex-1 min-h-0">

            {/* Left column */}
            <div className="flex flex-col gap-6 w-80 flex-shrink-0">
              {/* Output Directory */}
              <div className="bg-surface rounded-3xl p-7 shadow-neostyle border-2 border-white">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-orange-100 rounded-lg text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined">folder_open</span>
                  </div>
                  <h2 className="font-display font-bold text-xl text-text">Output Directory</h2>
                </div>
                <div className="flex flex-col gap-3">
                  <input
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-text-muted font-mono text-sm focus:border-primary focus:ring-0 shadow-inner-depth outline-none"
                    readOnly
                    type="text"
                    value={settings.outputDir || ""}
                    placeholder="(not set — prompt on download)"
                  />
                  <button
                    className="w-full bg-white text-text border-2 border-gray-200 px-6 py-3 rounded-xl font-bold shadow-button-depth-secondary squishy-btn hover:bg-gray-50 flex items-center justify-center gap-2"
                    onClick={handleBrowse}
                  >
                    <span className="material-symbols-outlined text-sm">folder_open</span>
                    Browse
                  </button>
                </div>
                <p className="mt-3 text-xs text-text-muted">
                  Leave blank to be prompted on each download.
                </p>
              </div>

              {/* About */}
              <div className="bg-surface rounded-3xl p-6 shadow-neostyle border-2 border-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg text-text-muted flex items-center justify-center">
                    <span className="material-symbols-outlined">info</span>
                  </div>
                  <h2 className="font-display font-bold text-xl text-text">About</h2>
                </div>
                <div className="space-y-2 text-sm text-text-muted">
                  <div className="flex justify-between">
                    <span className="font-medium">Version</span>
                    <span className="font-mono font-bold text-text">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Model</span>
                    <span className="font-mono font-bold text-text">KittenTTS nano</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Inference</span>
                    <span className="font-mono font-bold text-text">CPU-only</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Connectivity</span>
                    <span className="font-mono font-bold text-text">Offline</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column — Default Voice fills remaining space */}
            <div className="flex-1 bg-surface rounded-3xl p-7 shadow-neostyle border-2 border-white flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-500 flex items-center justify-center">
                  <span className="material-symbols-outlined">record_voice_over</span>
                </div>
                <h2 className="font-display font-bold text-xl text-text">Default Voice</h2>
              </div>
              <div className="grid grid-cols-4 gap-4 flex-1 content-start">
                {VOICES.map((v) => {
                  const active = settings.defaultVoice === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setSettings((s) => ({ ...s, defaultVoice: v }))}
                      className={`flex flex-col items-start gap-1.5 px-5 py-4 rounded-2xl border-2 transition-all text-left h-full min-h-[90px] ${
                        active
                          ? "border-primary bg-orange-50 shadow-neostyle"
                          : "border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/30"
                      }`}
                    >
                      <span className={`font-bold text-base ${active ? "text-primary" : "text-text"}`}>
                        {v}
                      </span>
                      <span className="text-xs text-text-muted leading-snug">{VOICE_DESC[v]}</span>
                      {active && (
                        <span className="material-symbols-outlined text-primary text-base mt-auto">check_circle</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-text-muted">
                This voice will be pre-selected when you open Studio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
