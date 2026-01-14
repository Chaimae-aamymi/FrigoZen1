
import React, { useState } from 'react';
import { User, Language } from '../types';
import { translations } from '../translations';

interface AuthProps {
  onLogin: (user: User) => void;
  lang: Language;
}

const Auth: React.FC<AuthProps> = ({ onLogin, lang }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ name: name || 'Chef', email });
  };

  // Vibrant and visible green palette
  const accentGreen = "#10b981"; // Emerald 500
  const darkGreen = "#064e3b";   // Emerald 900 for text contrast

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Dynamic and clean background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[25rem] h-[25rem] bg-slate-50 dark:bg-slate-900/20 rounded-full blur-[80px]"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none">
          
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 bg-emerald-500 rounded-[2.2rem] flex items-center justify-center text-white text-4xl shadow-xl shadow-emerald-500/30 mb-8 animate-bounce-slow">
              <i className="fa-solid fa-leaf"></i>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">FrigoZen</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest">
              {isLogin ? t.loginTitle : t.signupTitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-emerald-800 dark:text-emerald-400 tracking-widest ml-1">{t.authName}</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ex: Jean"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl px-6 py-4 transition-all font-bold text-slate-800 dark:text-white outline-none shadow-sm"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-emerald-800 dark:text-emerald-400 tracking-widest ml-1">{t.authEmail}</label>
              <input 
                type="email" 
                required 
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl px-6 py-4 transition-all font-bold text-slate-800 dark:text-white outline-none shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-emerald-800 dark:text-emerald-400 tracking-widest ml-1">{t.authPass}</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl px-6 py-4 transition-all font-bold text-slate-800 dark:text-white outline-none shadow-sm"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all transform active:scale-[0.98] text-lg mt-6"
            >
              {isLogin ? t.authLoginBtn : t.authSignupBtn}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors underline decoration-2 underline-offset-4"
            >
              {isLogin ? t.authToSignup : t.authToLogin}
            </button>
          </div>
        </div>
        
        <p className="mt-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
          &copy; 2024 FrigoZen • Anti-Gaspillage
        </p>
      </div>
    </div>
  );
};

export default Auth;
