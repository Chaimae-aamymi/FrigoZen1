
import React from 'react';
import { FoodItem, FoodCategory, Language } from '../types';
import { translations } from '../translations';

interface InventoryItemProps {
  item: FoodItem;
  onMarkAsUsed: (id: string, all: boolean) => void;
  onUpdateDate: (id: string, newDate: string) => void;
  lang: Language;
  themeTextClass: string;
}

const categoryIcons: Record<FoodCategory, string> = {
  [FoodCategory.FRUITS_VEGGIES]: 'fa-apple-whole text-emerald-600',
  [FoodCategory.DAIRY]: 'fa-cheese text-amber-600',
  [FoodCategory.MEAT_FISH]: 'fa-drumstick-bite text-stone-600',
  [FoodCategory.PANTRY]: 'fa-jar text-orange-600',
  [FoodCategory.BEVERAGES]: 'fa-bottle-water text-sky-600',
  [FoodCategory.FROZEN]: 'fa-snowflake text-blue-400',
  [FoodCategory.OTHER]: 'fa-box text-slate-400',
};

const InventoryItem: React.FC<InventoryItemProps> = ({ item, onMarkAsUsed, onUpdateDate, lang, themeTextClass }) => {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const expiryDate = new Date(item.expiryDate);
  const today = new Date();
  const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const getStatusInfo = () => {
    if (diffDays < 0) return { color: 'text-slate-400', label: t.expired };
    if (diffDays === 0) return { color: 'text-orange-600', label: t.expiresToday };
    if (diffDays === 1) return { color: 'text-orange-500', label: t.expiresTomorrow };
    return { color: 'text-slate-500', label: t.expiresIn.replace('{days}', diffDays.toString()) };
  };

  const status = getStatusInfo();
  const translatedCategory = t.categories[item.category] || item.category;

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-[1.75rem] p-5 border border-stone-100 dark:border-slate-800 flex items-center gap-5 transition-all duration-300 ${item.isUsed ? 'opacity-30' : 'hover:border-stone-200 hover:shadow-lg hover:shadow-stone-100 dark:hover:shadow-none group shadow-sm'}`}>
      <div className="w-12 h-12 rounded-2xl bg-stone-50 dark:bg-slate-800 flex items-center justify-center text-lg group-hover:scale-110 transition-transform shadow-inner">
        <i className={`fa-solid ${categoryIcons[item.category]}`}></i>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-slate-800 dark:text-white truncate text-sm">{item.name}</h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
          {item.currentQuantity > 0 ? `${item.currentQuantity} x ` : ''}{item.quantity} • {translatedCategory}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
           <label className="cursor-pointer group/date relative">
              <input 
                type="date" 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => onUpdateDate(item.id, e.target.value)}
              />
              <span className={`text-[9px] font-black uppercase tracking-widest ${status.color} hover:underline`}>
                {status.label}
              </span>
           </label>
        </div>
        {!item.isUsed && (
          <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
             {item.currentQuantity > 1 && (
               <button 
                onClick={(e) => { e.stopPropagation(); onMarkAsUsed(item.id, false); }}
                className={`px-2 py-1 rounded-lg border border-slate-200 flex items-center gap-1 text-[9px] font-black ${themeTextClass} hover:bg-stone-50 transition-colors whitespace-nowrap shadow-sm`}
              >
                <i className="fa-solid fa-minus scale-75"></i>
                <span>{t.usedOne}</span>
              </button>
             )}
            <button 
              onClick={(e) => { e.stopPropagation(); onMarkAsUsed(item.id, true); }}
              className={`text-[10px] font-black ${themeTextClass} hover:opacity-70 uppercase tracking-tighter transition-all`}
            >
              {t.used}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryItem;
