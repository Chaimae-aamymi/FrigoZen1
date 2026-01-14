
import React, { useState } from 'react';
import { AppView, Language, FoodItem } from '../types';
import { translations } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  setView: (view: AppView) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  isDark: boolean;
  toggleDark: () => void;
  expiringSoon: FoodItem[];
  themeColor: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setView, lang, setLang, isDark, toggleDark, expiringSoon, themeColor }) => {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const [showNotifs, setShowNotifs] = useState(false);

  const themeAccentClass = {
    sage: 'bg-[#82937E]',
    sand: 'bg-[#C2B280]',
    sky: 'bg-[#A3B7C9]',
    minimal: 'bg-slate-700'
  }[themeColor] || 'bg-emerald-600';

  const themeTextClass = {
    sage: 'text-[#5F6D5C]',
    sand: 'text-[#918356]',
    sky: 'text-[#6A7E91]',
    minimal: 'text-slate-800'
  }[themeColor] || 'text-emerald-700';

  const navItems: { id: AppView; icon: string; label: string }[] = [
    { id: 'dashboard', icon: 'fa-house', label: t.navHome },
    { id: 'fridge', icon: 'fa-box-archive', label: t.navFridge },
    { id: 'scan', icon: 'fa-plus', label: t.navScan },
    { id: 'recipes', icon: 'fa-utensils', label: t.navRecipes },
    { id: 'settings', icon: 'fa-sliders', label: t.navSettings },
  ];

  return (
    <div className={isRtl ? 'rtl' : 'ltr'} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col min-h-screen bg-[#FDFBF7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-500">
        
        {/* Header */}
        <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-stone-100 dark:border-slate-900 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className={`w-9 h-9 ${themeAccentClass} rounded-xl flex items-center justify-center text-white shadow-sm`}>
              <i className="fa-solid fa-leaf text-xs"></i>
            </div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">
              FrigoZen
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <i className="fa-solid fa-globe text-slate-400 text-[10px]"></i>
               <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent text-[10px] font-black py-1 px-1 border-none outline-none cursor-pointer text-slate-500 hover:text-slate-700 uppercase tracking-widest"
              >
                <option value="fr">FR</option>
                <option value="en">EN</option>
                <option value="ar">AR</option>
              </select>
            </div>
            
            <button 
              onClick={toggleDark}
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative text-slate-400 hover:text-slate-700 transition-colors"
              >
                <i className="fa-solid fa-bell"></i>
                {expiringSoon.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-orange-600 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></span>
                )}
              </button>

              {showNotifs && (
                <div className={`absolute top-10 ${isRtl ? 'left-0' : 'right-0'} w-72 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-stone-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95`}>
                   <div className="p-5 bg-stone-50 dark:bg-slate-800/50 flex justify-between items-center">
                      <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-500">{t.expiringTitle}</h4>
                      <button onClick={() => setShowNotifs(false)}><i className="fa-solid fa-xmark text-slate-400"></i></button>
                   </div>
                   <div className="max-h-64 overflow-y-auto">
                      {expiringSoon.length > 0 ? expiringSoon.map(item => (
                        <div key={item.id} className="p-5 border-b border-stone-50 dark:border-slate-800 last:border-0 hover:bg-stone-50 transition-colors">
                           <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-800 dark:text-slate-100">{item.name}</span>
                              <span className="text-orange-600 font-black bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-full">{new Date(item.expiryDate).toLocaleDateString()}</span>
                           </div>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-slate-400 text-xs italic">
                           Tout est parfait ! 🎉
                        </div>
                      )}
                   </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          {/* Sidebar (Desktop) */}
          <nav className={`hidden md:flex flex-col w-72 p-10 gap-10 border-x border-stone-100 dark:border-slate-900 bg-white/10`}>
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex items-center gap-5 px-6 py-4 rounded-3xl transition-all duration-300 ${
                    activeView === item.id 
                      ? `${themeAccentClass} text-white shadow-lg shadow-stone-200 dark:shadow-none translate-x-1` 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-stone-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} text-base`}></i>
                  <span className="text-sm font-black tracking-wide">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full mb-24 md:mb-0">
            {children}
          </main>
        </div>

        {/* Bottom Nav (Mobile) */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-stone-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-40 rounded-[2.5rem] shadow-2xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                activeView === item.id ? `${themeTextClass} scale-125` : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-xl`}></i>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
