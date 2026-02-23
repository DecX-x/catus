
interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-20 lg:w-64 bg-surface border-r border-orange-100 flex flex-col justify-between py-6 shadow-neostyle z-20">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-10 justify-center lg:justify-start">
          <div className="w-10 h-10 flex-shrink-0">
            <img src="/logo.png" alt="Catus" className="w-full h-full object-contain rounded-xl" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-text hidden lg:block">Catus</span>
        </div>
        <nav className="space-y-4">
          <button 
            onClick={() => setActiveTab('studio')}
            className={`w-full sidebar-item flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === 'studio' ? 'active' : 'hover:bg-orange-50 text-text-muted'}`}
          >
            <span className="material-symbols-outlined text-2xl group-hover:text-primary">edit_note</span>
            <span className="font-bold hidden lg:block">Studio</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full sidebar-item flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === 'history' ? 'active' : 'hover:bg-orange-50 text-text-muted'}`}
          >
            <span className="material-symbols-outlined text-2xl group-hover:text-primary">history</span>
            <span className="font-bold hidden lg:block">History</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full sidebar-item flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === 'settings' ? 'active' : 'hover:bg-orange-50 text-text-muted'}`}
          >
            <span className="material-symbols-outlined text-2xl group-hover:text-primary">settings</span>
            <span className="font-bold hidden lg:block">Settings</span>
          </button>
        </nav>
      </div>
      <div className="px-4 lg:px-6">
        <p className="text-xs text-text-muted text-center lg:text-left font-mono hidden lg:block">
          Catus v1.0.0
        </p>
      </div>
    </aside>
  );
}
