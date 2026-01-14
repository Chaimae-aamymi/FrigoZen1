
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import { FoodItem, FoodCategory, AppView, Recipe, Language, User } from './types';
import InventoryItem from './components/InventoryItem';
import ReceiptScanner from './components/ReceiptScanner';
import { suggestRecipes, generateRecipeImage, translateIngredients } from './services/geminiService';
import { translations } from './translations';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('frigozen_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState<AppView>('dashboard');
  const [items, setItems] = useState<FoodItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [lang, setLang] = useState<Language>((localStorage.getItem('frigozen_lang') as Language) || 'fr');
  const [isDark, setIsDark] = useState(localStorage.getItem('frigozen_dark') === 'true');
  const [themeColor, setThemeColor] = useState(localStorage.getItem('frigozen_theme') || 'sage');
  
  const isFirstMount = useRef(true);
  const prevLang = useRef(lang);

  const t = translations[lang];
  const isRtl = lang === 'ar';

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('frigozen_dark', isDark.toString());
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('frigozen_theme', themeColor);
  }, [themeColor]);

  useEffect(() => {
    const performTranslation = async () => {
      if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
      }
      if (prevLang.current === lang) return;
      if (items.length === 0) {
        prevLang.current = lang;
        return;
      }
      setTranslating(true);
      try {
        const namesToTranslate = items.map(i => i.name);
        const translatedMap = await translateIngredients(namesToTranslate, lang);
        setItems(prevItems => prevItems.map(item => ({
          ...item,
          name: translatedMap[item.name] || item.name
        })));
        prevLang.current = lang;
      } catch (err) {
        console.error("Translation failed", err);
      } finally {
        setTranslating(false);
      }
    };
    performTranslation();
    localStorage.setItem('frigozen_lang', lang);
  }, [lang, items.length]);

  useEffect(() => {
    if (user) localStorage.setItem('frigozen_user', JSON.stringify(user));
    else localStorage.removeItem('frigozen_user');
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem('frigozen_items');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('frigozen_items', JSON.stringify(items));
  }, [items]);

  const activeItems = useMemo(() => items.filter(i => !i.isUsed), [items]);
  const consumedCount = useMemo(() => items.filter(i => i.isUsed).length, [items]);
  const totalCount = items.length;
  const consumptionPercentage = useMemo(() => {
    if (totalCount === 0) return 0;
    return Math.round((consumedCount / totalCount) * 100);
  }, [consumedCount, totalCount]);

  const expiringSoon = useMemo(() => {
    const today = new Date();
    return activeItems.filter(item => {
      const exp = new Date(item.expiryDate);
      const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }, [activeItems]);

  const handleMarkAsUsed = (id: string, all: boolean = true) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        if (all || item.currentQuantity <= 1) {
          return { ...item, isUsed: true, currentQuantity: 0 };
        } else {
          return { ...item, currentQuantity: item.currentQuantity - 1 };
        }
      }
      return item;
    }));
  };

  const handleUpdateDate = (id: string, newDate: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, expiryDate: new Date(newDate).toISOString() } : item
    ));
  };

  const handleAddItems = (newItems: FoodItem[]) => {
    setItems(prev => [...newItems, ...prev]);
    setView('fridge');
  };

  const generateRecipesWithImages = async () => {
    if (activeItems.length === 0) return;
    setLoadingRecipes(true);
    setView('recipes');
    try {
      const suggested = await suggestRecipes(activeItems.map(i => i.name), lang);
      const recipesWithImages = await Promise.all(suggested.map(async (recipe: Recipe) => {
        const imageUrl = await generateRecipeImage(recipe.title);
        return { ...recipe, imageUrl: imageUrl || `https://picsum.photos/seed/${recipe.title}/800/450` };
      }));
      setRecipes(recipesWithImages);
    } catch (err) {
      console.error("Recipes failed", err);
    } finally {
      setLoadingRecipes(false);
    }
  };

  if (!user) return <Auth onLogin={setUser} lang={lang} />;

  // Darker shades for text accessibility on white backgrounds
  const themeAccentClass = {
    sage: 'bg-[#82937E] hover:bg-[#6D7D6A]',
    sand: 'bg-[#C2B280] hover:bg-[#AB9B6E]',
    sky: 'bg-[#A3B7C9] hover:bg-[#8CA2B5]',
    minimal: 'bg-slate-700 hover:bg-slate-800'
  }[themeColor] || 'bg-emerald-600 hover:bg-emerald-700';

  const themeTextClass = {
    sage: 'text-[#5F6D5C]',
    sand: 'text-[#918356]',
    sky: 'text-[#6A7E91]',
    minimal: 'text-slate-800'
  }[themeColor] || 'text-emerald-700';

  const themeSoftBgClass = {
    sage: 'bg-[#F2F5F1] dark:bg-emerald-950/20',
    sand: 'bg-[#FBF8F1] dark:bg-orange-950/20',
    sky: 'bg-[#F1F6F9] dark:bg-blue-950/20',
    minimal: 'bg-slate-50 dark:bg-slate-900'
  }[themeColor] || 'bg-emerald-50';

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div className="space-y-12 animate-in fade-in duration-500">
            <header className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.welcome.replace('{name}', user.name)}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t.subtitle.replace('{count}', activeItems.length.toString())}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setView('scan')}
                className={`group ${themeAccentClass} p-8 rounded-[2rem] text-white flex items-center justify-between transition-all duration-300 shadow-sm`}
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform">
                    <i className="fa-solid fa-camera"></i>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold">{t.scanBtn}</h3>
                    <p className="text-white/80 text-xs font-medium">{t.scanDesc.substring(0, 30)}...</p>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-white/50 group-hover:translate-x-1 transition-transform"></i>
              </button>

              <button 
                onClick={generateRecipesWithImages}
                className={`group ${themeSoftBgClass} p-8 rounded-[2rem] flex items-center justify-between transition-all duration-300 border border-stone-100 dark:border-slate-800`}
              >
                <div className="flex items-center gap-6">
                  <div className={`${themeAccentClass} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl group-hover:rotate-6 transition-transform shadow-sm`}>
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  <div className="text-left">
                    <h3 className={`text-xl font-bold ${themeTextClass}`}>{t.recipeBtn}</h3>
                    <p className="text-slate-500 text-xs font-medium">Strictement avec vos restes</p>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-slate-400 group-hover:translate-x-1 transition-transform"></i>
              </button>
            </div>

            {expiringSoon.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">{t.expiringTitle}</h3>
                  <button onClick={() => setView('fridge')} className={`${themeTextClass} text-xs font-bold hover:underline`}>{t.viewAll}</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {expiringSoon.slice(0, 4).map(item => (
                    <InventoryItem key={item.id} item={item} onMarkAsUsed={handleMarkAsUsed} onUpdateDate={handleUpdateDate} lang={lang} themeTextClass={themeTextClass} />
                  ))}
                </div>
              </section>
            )}

            <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-stone-100 dark:border-slate-800 flex justify-around shadow-sm">
                <div className="text-center">
                  <span className={`block text-3xl font-bold ${themeTextClass}`}>{consumptionPercentage}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.statConsumed}</span>
                </div>
                <div className="w-px h-10 bg-stone-100 dark:bg-slate-800 self-center"></div>
                <div className="text-center">
                  <span className="block text-3xl font-bold text-orange-500">{consumedCount}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.statAvoided}</span>
                </div>
            </section>
          </div>
        );

      case 'fridge':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold dark:text-white">{t.fridgeTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeItems.length > 0 ? activeItems.map(item => (
                <InventoryItem key={item.id} item={item} onMarkAsUsed={handleMarkAsUsed} onUpdateDate={handleUpdateDate} lang={lang} themeTextClass={themeTextClass} />
              )) : (
                <div className="col-span-full py-20 text-center text-slate-400 italic text-sm">
                  {t.emptyFridge}
                </div>
              )}
            </div>
          </div>
        );

      case 'scan':
        return <ReceiptScanner onItemsAdded={handleAddItems} lang={lang} />;

      case 'recipes':
        return (
          <div className="space-y-8 pb-10">
            <h2 className="text-2xl font-bold dark:text-white">{t.recipeTitle}</h2>
            {loadingRecipes ? (
              <div className="py-24 text-center space-y-4">
                <div className={`w-12 h-12 border-4 ${themeTextClass} border-t-transparent rounded-full animate-spin mx-auto`}></div>
                <p className="text-slate-500 font-medium text-sm">{t.loadingRecipes}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-10">
                {recipes.map((recipe, idx) => (
                  <article key={idx} className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-stone-100 dark:border-slate-800 shadow-sm transition-all hover:translate-y-[-4px]">
                    <div className="relative h-72">
                       <img src={recipe.imageUrl} className="w-full h-full object-cover" alt={recipe.title} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                       <div className="absolute bottom-6 left-8 right-8">
                          <h3 className={`text-3xl font-bold text-white mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>{recipe.title}</h3>
                          <div className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                             <span className={`${themeAccentClass} text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm`}>{recipe.prepTime}</span>
                          </div>
                       </div>
                    </div>
                    <div className="p-10 space-y-8">
                      <p className={`text-slate-600 text-lg italic leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>"{recipe.description}"</p>
                      <div className={`grid md:grid-cols-2 gap-10 ${isRtl ? 'direction-rtl' : 'direction-ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                         <div>
                            <h4 className={`text-[11px] font-black uppercase ${themeTextClass} tracking-widest mb-4 border-b pb-2 inline-block ${isRtl ? 'text-right' : 'text-left'}`}>{t.ingredientsHead}</h4>
                            <ul className={`space-y-2 mt-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                               {recipe.ingredients.map((ing, i) => (
                                 <li key={i} className={`text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                                   <div className={`w-1.5 h-1.5 ${themeAccentClass} rounded-full flex-shrink-0`}></div> 
                                   <span className="text-xs font-medium">{ing}</span>
                                 </li>
                               ))}
                            </ul>
                         </div>
                         <div>
                            <h4 className={`text-[11px] font-black uppercase ${themeTextClass} tracking-widest mb-4 border-b pb-2 inline-block ${isRtl ? 'text-right' : 'text-left'}`}>{t.stepsHead}</h4>
                            <div className="space-y-4 mt-2">
                               {recipe.instructions.map((step, i) => (
                                 <div key={i} className={`flex gap-4 ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                                    <span className={`font-black ${themeTextClass} text-sm flex-shrink-0`}>{i+1}</span>
                                    <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{step}</span>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <h2 className="text-2xl font-bold dark:text-white">{t.settingsTitle}</h2>
            
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-stone-100 dark:border-slate-800 shadow-sm space-y-12">
               <div className={`flex items-center gap-8 pb-10 border-b border-stone-50 dark:border-slate-800 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                  <div className={`w-20 h-20 ${themeSoftBgClass} rounded-full flex items-center justify-center ${themeTextClass} text-2xl font-bold`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold dark:text-white">{user.name}</h3>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
               </div>

               <div className="space-y-8">
                  <div>
                    <label className={`text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] block mb-6 ${isRtl ? 'text-right' : ''}`}>{t.themeChoice}</label>
                    <div className={`flex gap-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      {[
                        { id: 'sage', color: '#82937E' },
                        { id: 'sand', color: '#C2B280' },
                        { id: 'sky', color: '#A3B7C9' },
                        { id: 'minimal', color: '#334155' }
                      ].map(theme => (
                        <button 
                          key={theme.id}
                          onClick={() => setThemeColor(theme.id)}
                          className={`w-12 h-12 rounded-2xl transition-all duration-300 transform ${
                            themeColor === theme.id ? 'ring-4 ring-offset-4 ring-slate-100 scale-110' : 'opacity-60 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: theme.color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 space-y-2">
                    <button className={`w-full p-5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-slate-800 rounded-3xl transition-colors text-slate-700 dark:text-slate-300 ${isRtl ? 'flex-row-reverse' : ''}`}>
                       <span className="font-medium">{t.notifExpiry}</span>
                       <div className={`w-10 h-6 ${themeAccentClass} rounded-full relative flex items-center px-1`}>
                          <div className="w-4 h-4 bg-white rounded-full shadow-sm ml-auto"></div>
                       </div>
                    </button>
                    <button className={`w-full p-5 flex items-center justify-between text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-3xl transition-colors ${isRtl ? 'flex-row-reverse' : ''}`} onClick={() => { if(confirm(t.confirm)) setItems([]) }}>
                       <span className="font-medium">{t.clearFridge}</span>
                       <i className="fa-solid fa-trash-can text-sm"></i>
                    </button>
                    <button className={`w-full p-5 flex items-center justify-between text-slate-500 pt-8 ${isRtl ? 'flex-row-reverse' : ''}`} onClick={() => setUser(null)}>
                       <span className="font-medium">{t.logout}</span>
                       <i className="fa-solid fa-power-off text-sm"></i>
                    </button>
                  </div>
               </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <Layout 
      activeView={view} 
      setView={setView} 
      lang={lang} 
      setLang={setLang} 
      isDark={isDark} 
      toggleDark={() => setIsDark(!isDark)}
      expiringSoon={expiringSoon}
      themeColor={themeColor}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
