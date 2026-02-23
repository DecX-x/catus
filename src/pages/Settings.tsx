export function Settings() {
  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-[-50px] left-[200px] w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
      
      <header className="px-8 py-6 flex justify-between items-center bg-transparent z-10 flex-shrink-0">
        <div>
          <h1 className="font-display font-bold text-3xl text-text">Settings</h1>
          <p className="text-text-muted text-sm font-medium">Manage application preferences and storage.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-text border-2 border-gray-200 px-4 py-2 rounded-xl font-bold shadow-button-depth-secondary squishy-btn flex items-center gap-2 hover:bg-gray-50">
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            Reset Defaults
          </button>
          <button className="bg-primary text-white border-2 border-primary px-4 py-2 rounded-xl font-bold shadow-button-depth squishy-btn flex items-center gap-2 hover:bg-primaryDark">
            <span className="material-symbols-outlined text-sm">save</span>
            Save Changes
          </button>
        </div>
      </header>

      <div className="flex-1 px-8 pb-8 overflow-y-auto z-10">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div className="bg-surface rounded-3xl p-8 shadow-neostyle border-2 border-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">folder_open</span>
              </div>
              <h2 className="font-display font-bold text-xl text-text">Output Directory</h2>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-text-muted font-mono text-sm focus:border-primary focus:ring-0 shadow-inner-depth outline-none" 
                  readOnly 
                  type="text" 
                  value="C:/Users/ProUser/Documents/Catus/Exports"
                />
              </div>
              <button className="bg-white text-text border-2 border-gray-200 px-6 py-3 rounded-xl font-bold shadow-button-depth-secondary squishy-btn hover:bg-gray-50 flex-shrink-0">
                Browse
              </button>
            </div>
            <p className="mt-2 text-xs text-text-muted ml-1">Location where your generated audio files will be saved automatically.</p>
          </div>

          <div className="bg-surface rounded-3xl p-8 shadow-neostyle border-2 border-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-500 flex items-center justify-center">
                <span className="material-symbols-outlined">record_voice_over</span>
              </div>
              <h2 className="font-display font-bold text-xl text-text">Default Voice Model</h2>
            </div>
            <div className="relative max-w-md">
              <select className="w-full appearance-none bg-white border-2 border-gray-200 text-text font-bold text-lg rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-primary focus:ring-0 shadow-sm cursor-pointer hover:border-gray-300 transition-colors custom-select">
                <option value="jasper">Jasper (Male, Deep)</option>
                <option value="bella">Bella (Female, Soft)</option>
                <option value="luna">Luna (Female, Energetic)</option>
                <option value="max">Max (Male, Neutral)</option>
                <option value="coco">Coco (Female, Cheerful)</option>
                <option value="oliver">Oliver (Male, Young)</option>
                <option value="felix">Felix (Male, Narrative)</option>
                <option value="custom">Custom Voice...</option>
              </select>
            </div>
            <p className="mt-2 text-xs text-text-muted ml-1">This voice will be selected by default when starting a new project.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-surface rounded-3xl p-8 shadow-neostyle border-2 border-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-500 flex items-center justify-center">
                  <span className="material-symbols-outlined">palette</span>
                </div>
                <h2 className="font-display font-bold text-xl text-text">Appearance</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white border-2 border-primary shadow-neostyle-active relative overflow-hidden group">
                  <div className="absolute top-2 right-2 text-primary">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-primary mb-1">
                    <span className="material-symbols-outlined text-2xl">light_mode</span>
                  </div>
                  <span className="font-bold text-text">Light Mode</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-gray-50 border-2 border-transparent hover:border-gray-200 transition-all squishy-btn shadow-sm group">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-text-muted mb-1 group-hover:bg-gray-300 transition-colors">
                    <span className="material-symbols-outlined text-2xl">dark_mode</span>
                  </div>
                  <span className="font-bold text-text-muted group-hover:text-text">Dark Mode</span>
                </button>
              </div>
            </div>

            <div className="flex-1 bg-surface rounded-3xl p-8 shadow-neostyle border-2 border-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-lg text-[#FF6B6B] flex items-center justify-center">
                  <span className="material-symbols-outlined">database</span>
                </div>
                <h2 className="font-display font-bold text-xl text-text">Storage</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-bold text-text-muted">Cache Usage</span>
                  <span className="font-bold text-text">1.2 GB / 5.0 GB</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
                  <div className="bg-[#FF6B6B] h-3 rounded-full" style={{ width: "24%" }}></div>
                </div>
                <div className="pt-4">
                  <button className="w-full bg-white text-[#FF6B6B] border-2 border-[#FF6B6B] px-4 py-3 rounded-xl font-bold shadow-[0_4px_0_#E05050] squishy-btn flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
                    <span className="material-symbols-outlined">delete_forever</span>
                    Clear Cache & History
                  </button>
                  <p className="mt-2 text-center text-xs text-text-muted">This action cannot be undone.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-4 mb-8">
            <p className="text-xs text-text-muted font-mono">
              Catus App Framework v2.4.0 • Build 88291 • <a className="underline hover:text-primary" href="#">Check for Updates</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
