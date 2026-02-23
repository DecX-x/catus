export function History() {
  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-[-50px] left-[200px] w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
      
      <header className="px-8 py-6 flex justify-between items-center bg-transparent z-10 flex-shrink-0">
        <div>
          <h1 className="font-display font-bold text-3xl text-text">Generation History</h1>
          <p className="text-text-muted text-sm font-medium">Review past speech generations</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
              <span className="material-symbols-outlined text-xl">search</span>
            </span>
            <input className="pl-10 pr-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-text focus:outline-none focus:border-primary w-64 shadow-button-depth-secondary transition-all" placeholder="Search history..." type="text"/>
          </div>
          <button className="bg-white text-text border-2 border-gray-200 px-4 py-2 rounded-xl font-bold shadow-button-depth-secondary squishy-btn flex items-center gap-2 hover:bg-gray-50">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Filter
          </button>
        </div>
      </header>
      
      <div className="flex-1 px-8 pb-8 overflow-y-auto history-list z-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 pl-2">Today</h3>
            <div className="space-y-4">
              <HistoryItem 
                title="The quick brown fox jumps over the lazy dog..."
                speakerName="Bella"
                speakerImg="https://lh3.googleusercontent.com/aida-public/AB6AXuAKpMmSt-dCR_0XaIy4CMWrkvJfoA6U3B4y4M7TXxnKTnhf8eIgzinkvObbNHeSjVXML5aWug9-w4a0wUN7Up_eDwyEOtyh5oQnEqqpN4GyHikMchoG-YTdCCUy1Zx5RIeFhXb-AXqz86ckln_CYELKrTM_kaiRgXWYtfq0RgSn6DTRzriki7qfYLHux8Mum9bIU3tH3weekmajFrOR-gQJcHzdQ8Q_DhsmDtrQpu2G7duwFCpqAEfCuQ45leK5nNBMl1s2Yehp_WA"
                duration="00:12"
                time="2:30 PM"
              />
              <HistoryItem 
                title="Welcome to the future of offline text to speech..."
                speakerName="Jasper"
                speakerImg="https://lh3.googleusercontent.com/aida-public/AB6AXuDKxgTr8x9NrgmJXKyDxpXusqx8rALJU--XWvujVacl9bcMjwIVZxJY0Gf3asel6OxCui49tvruisprwIuLuL8Jepyj4HZwfPeFBuVALI973nJd3P0I9XUoxX4rK8yc4R-NS7at1h65Xcz-PoeGEi7uAftZqqQ-TUM13O_vSSgsexbX-Zcw3cE5fHxhq7110CCK6XJmx9Hrae72omG84ckSYAcLOXtJl6vCdwQpcHyXMM9sw8kIO0v13U4raCl1qyGtdIyCEqslrlo"
                duration="01:45"
                time="11:15 AM"
              />
              <HistoryItem 
                title="Project Delta meeting notes summary regarding..."
                speakerName="Luna"
                speakerImg="https://lh3.googleusercontent.com/aida-public/AB6AXuCnSItD67jYd77LMgObiD3Y1rgBBkY-J6M2SD_mXhUuTFfa2uaKo7a3evvfkIw_DoF4yNVqcVqKUPhkGuGCkjY_Kw7DtxLKEqwMDZkEQKQkEjFOdn4qQ_XTMxJveqFppJ4UlUkt6TU_zE9zrK3jHv6fAzr7AoXCGmV5815q9M94oNUeH68wYsSZrKG_j8sJ3rW0shbWaeswMpOo7ueZOtJzFDqvbVbJ1ixry59DmCBZQM-jxoCjYEqNMTjdo6_7Dsqm24XWmBo6Hww"
                duration="00:32"
                time="09:42 AM"
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 mt-8 pl-2">Yesterday</h3>
            <div className="space-y-4">
              <HistoryItem 
                title="A gentle reminder to check your hydration levels..."
                speakerName="Coco"
                speakerImg="https://lh3.googleusercontent.com/aida-public/AB6AXuByt7ad4SLQBCFWfo-CSdcT4Qn9uiQr2kTmSoUHiz-E19af6m0ymOW0YvWXMlfSXIRsBysepgg4veq0sQ1ArcpikFMQI9L0ajfGr2czT6jhzYsr1jnx-k_v9YTogzsBXVTNUiTZTt3kenWqrPIkbvlpQa3E7ZEhz6m3C8w4rNUiEDx3RGBDeaQpn4B31ttA9HMKam1NGLHraRX32C6UZQs5co5xMC5Iu0tZB1lPo9ilMokuIKSJx0cb9WpyFmGSfeSvf5Wgqdx-Lug"
                duration="00:08"
                time="5:15 PM"
                dimmed
              />
              <HistoryItem 
                title="Chapter 3: The unexpected journey into the..."
                speakerName="Oliver"
                speakerImg="https://lh3.googleusercontent.com/aida-public/AB6AXuCUk8L1WY0h2m-x4KaiNixzozMc3ZJMX_x8vGo0MJ3mT-RiiBr0oabcWBz23mgMavDbRkh9mZz4SewPuMZ2YIg1ddpUFJmRz1a4Rsub18SjB6MN32Exw6gkwCsXHX2kNzUfNc_5FhB9DOZ5bOZ3T3WVllTLzr3AUipadndedlW7E9qCwUWI7gFidPGI81qymroQHwNTdGddeleOY4FRLSpYaRgqilYmdwTRP3gS5RBMYlkS6PdjzfLgDNQr7lUmSAR2qpO_RHtvv8k"
                duration="12:40"
                time="1:20 PM"
                dimmed
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function HistoryItem({ title, speakerName, speakerImg, duration, time, dimmed = false }: any) {
  return (
    <div className={`bg-surface rounded-2xl p-4 shadow-neostyle border border-white hover:shadow-neostyle-hover hover:translate-y-[2px] transition-all duration-200 flex items-center gap-4 group ${dimmed ? 'opacity-80 hover:opacity-100' : ''}`}>
      <button className="w-12 h-12 rounded-full bg-orange-50 text-primary hover:bg-primary hover:text-white flex items-center justify-center shadow-sm border-2 border-orange-100 transition-colors flex-shrink-0">
        <span className="material-symbols-outlined text-2xl ml-0.5">play_arrow</span>
      </button>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-text text-lg truncate mb-1">{title}</h4>
        <div className="flex items-center gap-4 text-sm text-text-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-200">
              <img alt={speakerName} className="w-full h-full object-cover" src={speakerImg}/>
            </div>
            <span className="font-medium">{speakerName}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">schedule</span>
            <span>{duration}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span>{time}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 hover:bg-orange-50 hover:text-primary text-text-muted rounded-xl transition-colors" title="Download">
          <span className="material-symbols-outlined">download</span>
        </button>
        <button className="p-2 hover:bg-red-50 hover:text-red-500 text-text-muted rounded-xl transition-colors" title="Delete">
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  );
}
