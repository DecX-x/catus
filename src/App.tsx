import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Studio } from "./pages/Studio";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import type { AppSettings } from "./pages/Settings";
import "./App.css";

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem("catus_settings");
    if (raw) return JSON.parse(raw) as AppSettings;
  } catch {}
  return { defaultVoice: "Jasper", outputDir: "" };
}

function App() {
  const [activeTab, setActiveTab] = useState("studio");
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  // Re-read settings whenever the user navigates back to studio (picks up saves from Settings page)
  useEffect(() => {
    if (activeTab === "studio") {
      setSettings(loadSettings());
    }
  }, [activeTab]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "studio" && <Studio defaultVoice={settings.defaultVoice} />}
      {activeTab === "history" && <History />}
      {activeTab === "settings" && <Settings />}
    </div>
  );
}

export default App;
