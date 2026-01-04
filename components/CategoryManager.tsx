
import React from 'react';
import { ArrowLeft, Plus, Settings2, Hash } from 'lucide-react';
import { Category } from '../types';
import { ICON_MAP } from '../constants';

interface CategoryManagerProps {
  categories: Category[];
  transactionCounts: Record<string, number>;
  onEdit: (category: Category) => void;
  onAdd: () => void;
  onBack: () => void;
  isDarkMode?: boolean;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  categories, transactionCounts, onEdit, onAdd, onBack, isDarkMode 
}) => {
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
  const incomeCategories = categories.filter(c => c.type === 'INCOME');

  const renderCategoryList = (list: Category[], title: string) => (
    <div className="space-y-3">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {list.map(cat => (
          <div 
            key={cat.id} 
            onClick={() => onEdit(cat)}
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-50 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                {ICON_MAP[cat.iconName]}
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-slate-100">{cat.name}</p>
                <div className="flex items-center gap-1.5">
                  <Hash size={10} className="text-slate-300" />
                  <p className="text-[10px] font-bold text-slate-400">{transactionCounts[cat.id] || 0} Transactions</p>
                </div>
              </div>
            </div>
            <Settings2 size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-8 pb-40 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all active:scale-90">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black">Categories</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Organize Records</p>
          </div>
        </div>
        <button onClick={onAdd} className="h-12 w-12 bg-blue-600 text-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all">
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="space-y-8">
        {renderCategoryList(expenseCategories, "Expense Categories")}
        {renderCategoryList(incomeCategories, "Income Categories")}
      </div>
    </div>
  );
};
