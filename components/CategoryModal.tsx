
import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react';
import { TransactionType, Category } from '../types';
import { IconSelector } from './IconSelector';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: Omit<Category, 'id'>) => void;
  onUpdate?: (category: Category) => void;
  onDelete?: (id: string) => void;
  initialCategory?: Category | null;
  transactionCount?: number;
  isDarkMode?: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ 
  isOpen, onClose, onAdd, onUpdate, onDelete, initialCategory, transactionCount = 0, isDarkMode 
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [iconName, setIconName] = useState('others');
  const [color, setColor] = useState('#3b82f6');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setName(initialCategory.name);
      setType(initialCategory.type);
      setIconName(initialCategory.iconName);
      setColor(initialCategory.color);
    } else {
      setName('');
      setType(TransactionType.EXPENSE);
      setIconName('others');
      setColor('#3b82f6');
    }
    setConfirmDelete(false);
  }, [initialCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const data = { name, type, iconName, color };
    if (initialCategory && onUpdate) {
      onUpdate({ ...data, id: initialCategory.id });
    } else {
      onAdd(data);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    } else if (initialCategory && onDelete) {
      onDelete(initialCategory.id);
      onClose();
    }
  };

  const COLORS = [
    '#ef4444', '#f43f5e', '#ec4899', '#d946ef', '#a855f7',
    '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4',
    '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308',
    '#f59e0b', '#f97316', '#64748b', '#475569', '#000000'
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className={`w-full max-w-sm rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up max-h-[92vh] flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div 
          className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}
          style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top))' }}
        >
          <div className="space-y-0.5">
            <h2 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{initialCategory ? 'Edit Category' : 'New Category'}</h2>
            {initialCategory && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{transactionCount} Transactions linked</p>
            )}
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
           <div className={`flex p-1.5 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
            <button
              type="button"
              disabled={!!initialCategory}
              onClick={() => setType(TransactionType.EXPENSE)}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                type === TransactionType.EXPENSE 
                  ? (isDarkMode ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm') 
                  : 'text-gray-400'
              } ${initialCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              EXPENSE
            </button>
            <button
              type="button"
              disabled={!!initialCategory}
              onClick={() => setType(TransactionType.INCOME)}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                type === TransactionType.INCOME 
                  ? (isDarkMode ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm') 
                  : 'text-gray-400'
              } ${initialCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              INCOME
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category Name</label>
            <input
              type="text"
              className={`w-full h-14 px-5 rounded-2xl border-2 border-transparent outline-none transition-all font-bold text-sm shadow-sm ${isDarkMode ? 'bg-slate-800 text-gray-100 focus:bg-slate-700' : 'bg-slate-50 text-gray-800 focus:bg-white focus:border-blue-100'}`}
              placeholder="e.g., Subscription"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Icon Selection</label>
            <IconSelector selectedIcon={iconName} onSelect={setIconName} isDarkMode={isDarkMode} />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Theme Color</label>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-full aspect-square rounded-xl border-4 transition-all ${
                    color === c ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-[0.98] shadow-xl shadow-blue-600/20"
          >
            <CheckCircle2 size={20} />
            <span>{initialCategory ? 'Save Changes' : 'Create Category'}</span>
          </button>

          {initialCategory && onDelete && (
            <button 
              type="button"
              onClick={handleDelete} 
              className={`w-full h-14 rounded-2xl font-black flex items-center justify-center gap-3 border-2 transition-all active:scale-[0.98] mt-2 ${confirmDelete ? 'bg-red-600 border-red-600 text-white animate-pulse' : 'bg-transparent border-red-50 text-red-500 hover:bg-red-50 dark:border-red-900/10'}`}
            >
              {confirmDelete ? <AlertTriangle size={18} /> : <Trash2 size={18} />}
              <span>{confirmDelete ? 'Tap to Confirm' : 'Delete Category'}</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
