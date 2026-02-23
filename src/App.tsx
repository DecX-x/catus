import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Studio } from "./pages/Studio";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState('studio');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === 'studio' && <Studio />}
      {activeTab === 'history' && <History />}
      {activeTab === 'settings' && <Settings />}
    </div>
  );
}

export default App;
