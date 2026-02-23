import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-20 lg:w-64 bg-surface border-r border-orange-100 flex flex-col justify-between py-6 shadow-neostyle z-20">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-10 justify-center lg:justify-start">
          <div className="bg-primary text-white p-2 rounded-xl shadow-neostyle flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">pets</span>
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
            className="w-full sidebar-item flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group hover:bg-orange-50 text-text-muted"
          >
            <span className="material-symbols-outlined text-2xl group-hover:text-primary">library_books</span>
            <span className="font-bold hidden lg:block">Presets</span>
          </button>
          <button 
            className="w-full sidebar-item flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group hover:bg-orange-50 text-text-muted"
          >
            <span className="material-symbols-outlined text-2xl group-hover:text-primary">settings</span>
            <span className="font-bold hidden lg:block">Settings</span>
          </button>
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
  );
}
