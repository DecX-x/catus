import { useState } from "react";
import "./App.css";

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog. But in this digital age, the fox prefers to stream his adventures in 4K resolution while the dog blogs about sustainable bone burying practices.");

  return (
    <>
      <aside className="w-20 lg:w-64 bg-surface border-r border-orange-100 flex flex-col justify-between py-6 shadow-neostyle z-20">
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-3 mb-10 justify-center lg:justify-start">
            <div className="bg-primary text-white p-2 rounded-xl shadow-neostyle flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">pets</span>
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-text hidden lg:block">Catus</span>
          </div>
          <nav className="space-y-4">
            <a className="sidebar-item active flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group" href="#">
              <span className="material-symbols-outlined text-2xl group-hover:text-primary">edit_note</span>
              <span className="font-bold hidden lg:block">Studio</span>
            </a>
            <a className="sidebar-item flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group hover:bg-orange-50 text-text-muted" href="#">
              <span className="material-symbols-outlined text-2xl group-hover:text-primary">history</span>
              <span className="font-bold hidden lg:block">History</span>
            </a>
            <a className="sidebar-item flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group hover:bg-orange-50 text-text-muted" href="#">
              <span className="material-symbols-outlined text-2xl group-hover:text-primary">library_books</span>
              <span className="font-bold hidden lg:block">Presets</span>
            </a>
            <a className="sidebar-item flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group hover:bg-orange-50 text-text-muted" href="#">
              <span className="material-symbols-outlined text-2xl group-hover:text-primary">settings</span>
              <span className="font-bold hidden lg:block">Settings</span>
            </a>
          </nav>
        </div>
        <div className="px-4 lg:px-6">
          <div className="bg-secondary/30 rounded-2xl p-4 border border-orange-100 hidden lg:block">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary">computer</span>
              <span className="text-xs font-bold text-primaryDark uppercase">System Load</span>
            </div>
            <div className="w-full bg-white rounded-full h-2 mb-1">
              <div className="bg-primary h-2 rounded-full" style={{ width: "12%" }}></div>
            </div>
            <span className="text-xs text-text-muted">CPU Usage: 12%</span>
          </div>
          <div className="mt-4 flex items-center justify-center lg:justify-start gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
              <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAe5D_yxwpCb7QgY-DtCFM0MCq9CV7H-dzXpkG9skr50PC2b5ObJhHlY7WLSbRHiSKQ7aP-EzZzB_cH_yAyvAHlQl_SL0mJljvfr2f_J63V045Tf7Wm8R-Oeh70jpZYLEBYZHkF4LAwlob5XBhjfj9zVKfZAAT_EgjMBL65CddPNB_-yRF91qc_VkRKfdau-mtd4JQw8o37wfCgnqiFfa-m7_D49Fu3V2jEURxTr5Wt0q32-zZlt4l6m1wtGgLOg6vjLMSm0g9wU4w"/>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-bold text-text">Pro User</p>
              <p className="text-xs text-text-muted">v1.0.4 Local</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-[-50px] left-[200px] w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
        
        <header className="px-8 py-6 flex justify-between items-center bg-transparent z-10">
          <div>
            <h1 className="font-display font-bold text-3xl text-text">New Project</h1>
            <p className="text-text-muted text-sm font-medium">Last saved locally 2 mins ago</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white text-text border-2 border-gray-200 px-4 py-2 rounded-xl font-bold shadow-button-depth-secondary squishy-btn flex items-center gap-2 hover:bg-gray-50">
              <span className="material-symbols-outlined text-sm">upload_file</span>
              Import Text
            </button>
            <button className="bg-white text-text border-2 border-gray-200 px-4 py-2 rounded-xl font-bold shadow-button-depth-secondary squishy-btn flex items-center gap-2 hover:bg-gray-50">
              <span className="material-symbols-outlined text-sm">save</span>
              Save
            </button>
          </div>
        </header>

        <div className="flex-1 px-8 pb-8 flex flex-col lg:flex-row gap-6 overflow-hidden">
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            <div className="bg-surface rounded-3xl p-1 shadow-neostyle border-2 border-white flex-1 flex flex-col relative group">
              <div className="absolute top-4 right-4 flex gap-2 z-10 opacity-50 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-gray-100 rounded-lg text-text-muted transition-colors" title="Clear" onClick={() => setText('')}>
                  <span className="material-symbols-outlined text-lg">delete_sweep</span>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg text-text-muted transition-colors" title="Paste" onClick={async () => {
                  try {
                    const clipboardText = await navigator.clipboard.readText();
                    setText((prev) => prev + clipboardText);
                  } catch (e) {
                    console.error("Failed to read clipboard", e);
                  }
                }}>
                  <span className="material-symbols-outlined text-lg">content_paste</span>
                </button>
              </div>
              <textarea 
                className="w-full h-full p-6 bg-gray-50/50 rounded-[1.3rem] border-none focus:ring-0 resize-none text-lg text-text placeholder-gray-400 font-medium leading-relaxed shadow-inner-depth outline-none" 
                placeholder="Type or paste your text here to convert to speech..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="absolute bottom-4 right-6 text-xs font-bold text-text-muted bg-white/80 px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                {text.length} / 5000 chars
              </div>
            </div>

            <div className={`bg-surface rounded-2xl p-4 shadow-neostyle border border-orange-100 flex items-center gap-4 ${isPlaying ? 'playing' : ''}`}>
              <button 
                className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-button-depth squishy-btn flex-shrink-0"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                <span className="material-symbols-outlined text-2xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
              </button>
              
              <div className="flex-1 flex items-center gap-1 h-12 px-2">
                {[...Array(24)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1 rounded-full ${i % 2 === 0 ? 'bg-primary' : 'bg-orange-200'} ${isPlaying ? 'wave-bar' : 'h-1/3'}`} 
                    style={isPlaying ? { animationDelay: `${(i % 5) * 0.1}s` } : {}}
                  ></div>
                ))}
              </div>

              <div className="text-xs font-mono font-bold text-text-muted">00:12 / 00:45</div>
              <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
              <button className="p-2 hover:bg-gray-100 rounded-full text-text transition-colors" title="Download">
                <span className="material-symbols-outlined">download</span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full text-text transition-colors" title="Share">
                <span className="material-symbols-outlined">share</span>
              </button>
            </div>
          </div>

          <div className="w-full lg:w-96 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
            <button className="w-full bg-primary text-white py-4 rounded-2xl font-display font-bold text-xl shadow-button-depth squishy-btn flex items-center justify-center gap-2 group hover:bg-primaryDark transition-colors">
              <span className="material-symbols-outlined text-3xl group-hover:animate-spin">autorenew</span>
              Generate Speech
            </button>
            
            <div className="bg-surface p-6 rounded-3xl shadow-neostyle border border-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg text-text flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">record_voice_over</span>
                  Voice Selection
                </h2>
                <span className="text-xs font-bold text-primary bg-orange-50 px-2 py-1 rounded">8 Available</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { name: 'Jasper', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKxgTr8x9NrgmJXKyDxpXusqx8rALJU--XWvujVacl9bcMjwIVZxJY0Gf3asel6OxCui49tvruisprwIuLuL8Jepyj4HZwfPeFBuVALI973nJd3P0I9XUoxX4rK8yc4R-NS7at1h65Xcz-PoeGEi7uAftZqqQ-TUM13O_vSSgsexbX-Zcw3cE5fHxhq7110CCK6XJmx9Hrae72omG84ckSYAcLOXtJl6vCdwQpcHyXMM9sw8kIO0v13U4raCl1qyGtdIyCEqslrlo', active: true },
                  { name: 'Bella', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKpMmSt-dCR_0XaIy4CMWrkvJfoA6U3B4y4M7TXxnKTnhf8eIgzinkvObbNHeSjVXML5aWug9-w4a0wUN7Up_eDwyEOtyh5oQnEqqpN4GyHikMchoG-YTdCCUy1Zx5RIeFhXb-AXqz86ckln_CYELKrTM_kaiRgXWYtfq0RgSn6DTRzriki7qfYLHux8Mum9bIU3tH3weekmajFrOR-gQJcHzdQ8Q_DhsmDtrQpu2G7duwFCpqAEfCuQ45leK5nNBMl1s2Yehp_WA' },
                  { name: 'Luna', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnSItD67jYd77LMgObiD3Y1rgBBkY-J6M2SD_mXhUuTFfa2uaKo7a3evvfkIw_DoF4yNVqcVqKUPhkGuGCkjY_Kw7DtxLKEqwMDZkEQKQkEjFOdn4qQ_XTMxJveqFppJ4UlUkt6TU_zE9zrK3jHv6fAzr7AoXCGmV5815q9M94oNUeH68wYsSZrKG_j8sJ3rW0shbWaeswMpOo7ueZOtJzFDqvbVbJ1ixry59DmCBZQM-jxoCjYEqNMTjdo6_7Dsqm24XWmBo6Hww' },
                  { name: 'Max', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_h5nHdjO6oQBpdz5WNos427DlPUKqbpfbKZBc6lwcr4BXI8MWVdaUgzqSsCAkIbCriSmSH5z3xuX7H6ySRtlY5SpB19OnBvdN8IRMHN567yeYtkcvw8OH8YamWjc1F1AHx2QOFSg9boPDc9nQjrmzpkC8t5wF9pX-qbUpKhCKjHozei_HY2stt1qhv4t-61UG8IXuQkLSF_XnxFTRcFFp58JHx446ZkSbKdHeO6FbuLi4waFAyubXJ9pD1CKfOXUbQgFP89DkFpc' },
                  { name: 'Coco', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByt7ad4SLQBCFWfo-CSdcT4Qn9uiQr2kTmSoUHiz-E19af6m0ymOW0YvWXMlfSXIRsBysepgg4veq0sQ1ArcpikFMQI9L0ajfGr2czT6jhzYsr1jnx-k_v9YTogzsBXVTNUiTZTt3kenWqrPIkbvlpQa3E7ZEhz6m3C8w4rNUiEDx3RGBDeaQpn4B31ttA9HMKam1NGLHraRX32C6UZQs5co5xMC5Iu0tZB1lPo9ilMokuIKSJx0cb9WpyFmGSfeSvf5Wgqdx-Lug' },
                  { name: 'Oliver', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUk8L1WY0h2m-x4KaiNixzozMc3ZJMX_x8vGo0MJ3mT-RiiBr0oabcWBz23mgMavDbRkh9mZz4SewPuMZ2YIg1ddpUFJmRz1a4Rsub18SjB6MN32Exw6gkwCsXHX2kNzUfNc_5FhB9DOZ5bOZ3T3WVllTLzr3AUipadndedlW7E9qCwUWI7gFidPGI81qymroQHwNTdGddeleOY4FRLSpYaRgqilYmdwTRP3gS5RBMYlkS6PdjzfLgDNQr7lUmSAR2qpO_RHtvv8k' },
                  { name: 'Felix', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsOzKSipgVkf3A9Y5tCPIoK_hiUQQ48uIMv-Z9Zzv4i1hHerLMBpSPVrnOhL5N3BNO5d_BbXst-r33CzIcp732bVf33adwEANK0XeedaTsazMN9_3nJie8oX2fj4xzHle6vfAy_ceyqD1Nv4gHkggwKGaW24fZharLEVvw6I7WErF_ymDt4FgIdXOoJq_Rk0WG3B54Aktt41MyMiWACAuRIf1vFe0lhQTtbL9ypHigHjSAZ05sZWfC4E1z1ilJRRvGoqaBC_2kBGQ' },
                ].map(v => (
                  <div key={v.name} className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className={`w-14 h-14 rounded-full border-2 ${v.active ? 'bg-[#F0F4F8] voice-avatar selected' : 'bg-white border-transparent hover:border-gray-200 voice-avatar'} overflow-hidden transition-all relative`}>
                      <img alt={v.name} className={`w-full h-full object-cover ${v.active ? '' : 'opacity-90 group-hover:opacity-100'}`} src={v.img}/>
                    </div>
                    <span className={`text-xs font-medium ${v.active ? 'text-primary font-bold' : 'text-text-muted group-hover:text-text'}`}>{v.name}</span>
                  </div>
                ))}
                
                <div className="flex flex-col items-center gap-1 cursor-pointer group">
                  <div className="w-14 h-14 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 hover:border-primary voice-avatar overflow-hidden transition-all relative flex items-center justify-center text-gray-400 hover:text-primary hover:bg-orange-50">
                    <span className="material-symbols-outlined">add</span>
                  </div>
                  <span className="text-xs font-medium text-text-muted group-hover:text-text">Add</span>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-3xl shadow-neostyle border border-white flex flex-col gap-5">
              <h2 className="font-bold text-lg text-text flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">tune</span>
                Parameters
              </h2>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-bold text-text-muted">Speed</label>
                  <span className="text-sm font-bold text-primary">1.0x</span>
                </div>
                <div className="relative w-full h-3 bg-gray-100 rounded-full shadow-inner">
                  <div className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{ width: "50%" }}></div>
                  <div className="absolute top-1/2 left-1/2 w-5 h-5 bg-white border-2 border-primary rounded-full shadow transform -translate-y-1/2 -translate-x-1/2 cursor-grab"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-bold text-text-muted">Pitch</label>
                  <span className="text-sm font-bold text-primary">Normal</span>
                </div>
                <div className="relative w-full h-3 bg-gray-100 rounded-full shadow-inner">
                  <div className="absolute top-0 left-0 h-full bg-secondary rounded-full" style={{ width: "50%" }}></div>
                  <div className="absolute top-1/2 left-1/2 w-5 h-5 bg-white border-2 border-secondary rounded-full shadow transform -translate-y-1/2 -translate-x-1/2 cursor-grab"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t border-gray-100 mt-2">
                <span className="text-sm font-bold text-text-muted">Stability Boost</span>
                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
                </div>
              </div>
            </div>

            <div className="bg-surface p-4 rounded-2xl shadow-neostyle border border-white flex gap-2">
              <button className="flex-1 py-2 text-sm font-bold text-white bg-text rounded-xl shadow-md">.WAV</button>
              <button className="flex-1 py-2 text-sm font-bold text-text-muted hover:bg-gray-50 rounded-xl transition-colors">.MP3</button>
              <button className="flex-1 py-2 text-sm font-bold text-text-muted hover:bg-gray-50 rounded-xl transition-colors">.OGG</button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
