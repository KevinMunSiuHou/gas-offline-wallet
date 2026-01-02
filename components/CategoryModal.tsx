
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TransactionType, Category } from '../types';
import { IconSelector } from './IconSelector';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: Omit<Category, 'id'>) => void;
  isDarkMode?: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onAdd, isDarkMode }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [iconName, setIconName] = useState('others');
  const [color, setColor] = useState('#3b82f6');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAdd({ name, type, iconName, color });
    setName('');
    onClose();
  };

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#000000'];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>New Category</h2>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           <div className={`flex p-1 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
            <button
              type="button"
              onClick={() => setType(TransactionType.EXPENSE)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                type === TransactionType.EXPENSE 
                  ? (isDarkMode ? 'bg-slate-700 text-red-400 shadow-sm' : 'bg-white text-red-600 shadow-sm') 
                  : 'text-gray-500'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.INCOME)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                type === TransactionType.INCOME 
                  ? (isDarkMode ? 'bg-slate-700 text-green-400 shadow-sm' : 'bg-white text-green-600 shadow-sm') 
                  : 'text-gray-500'
              }`}
            >
              Income
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Name</label>
            <input
              type="text"
              className={`w-full p-3 rounded-xl border-none outline-none transition-all ${isDarkMode ? 'bg-slate-800 text-gray-100 focus:bg-slate-700' : 'bg-gray-50 text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500'}`}
              placeholder="e.g., Subscription"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Icon</label>
            <div className={`p-1 rounded-xl ${isDarkMode ? 'bg-slate-800' : ''}`}>
              <IconSelector selectedIcon={iconName} onSelect={setIconName} isDarkMode={isDarkMode} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Color</label>
            <div className="flex flex-wrap gap-2 justify-between">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c ? (isDarkMode ? 'border-white scale-110' : 'border-gray-900 scale-110') : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-900/10"
          >
            Create Category
          </button>
        </form>
      </div>
    </div>
  );
};
