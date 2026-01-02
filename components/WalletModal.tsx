
import React, { useState, useEffect } from 'react';
import { X, Search, Trash2, AlertTriangle, ChevronDown } from 'lucide-react';
import { Wallet } from '../types';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (wallet: Omit<Wallet, 'id'>) => void;
  onUpdate?: (wallet: Wallet) => void;
  onDelete?: (id: string) => void;
  initialWallet?: Wallet | null;
  availableTypes: string[];
  isDarkMode?: boolean;
}

export const WalletModal: React.FC<WalletModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  onUpdate, 
  onDelete,
  initialWallet,
  availableTypes,
  isDarkMode
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (initialWallet) {
      setName(initialWallet.name);
      setType(initialWallet.type);
      setBalance(initialWallet.balance.toString());
      setColor(initialWallet.color);
    } else {
      setName('');
      setType('Bank Account');
      setBalance('');
      setColor('#3b82f6');
    }
    setConfirmDelete(false);
  }, [initialWallet, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const walletData = { 
      name: name || type, 
      balance: parseFloat(balance) || 0, 
      type: type || 'Other', 
      color 
    };

    if (initialWallet && onUpdate) {
      onUpdate({ ...walletData, id: initialWallet.id });
    } else {
      onAdd(walletData);
    }
    
    onClose();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    } else if (initialWallet && onDelete) {
      onDelete(initialWallet.id);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#000000', '#ec4899', '#6366f1'];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            {initialWallet ? 'Edit Wallet' : 'Add Wallet'}
          </h2>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Type</label>
              <div className="relative">
                <input
                  list="wallet-type-suggestions"
                  type="text"
                  placeholder="Bank Account..."
                  className={`w-full p-3.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10 font-bold ${isDarkMode ? 'bg-slate-800 text-gray-100' : 'bg-gray-50 text-gray-800'}`}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                <datalist id="wallet-type-suggestions">
                  {availableTypes.map(t => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Name</label>
              <input
                type="text"
                className={`w-full p-3.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold ${isDarkMode ? 'bg-slate-800 text-gray-100' : 'bg-gray-50 text-gray-800'}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Starting Balance (RM)</label>
              <input
                type="number"
                step="0.01"
                className={`w-full p-3.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold transition-all ${isDarkMode ? 'bg-slate-800 text-gray-100' : 'bg-gray-50 text-gray-800'}`}
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Color Theme</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 mt-4"
            >
              {initialWallet ? 'Update Wallet' : 'Save Wallet'}
            </button>
          </form>

          {initialWallet && onDelete && (
            <div className="pt-4 border-t border-dashed border-slate-200 dark:border-slate-800">
               <button
                type="button"
                onClick={handleDeleteClick}
                className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border-2 ${
                  confirmDelete 
                  ? 'bg-red-600 border-red-600 text-white animate-pulse' 
                  : 'bg-transparent border-red-100 dark:border-red-900/10 text-red-500'
                }`}
              >
                {confirmDelete ? <AlertTriangle size={18} /> : <Trash2 size={18} />}
                <span>{confirmDelete ? 'Tap again to Delete' : 'Delete Wallet'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
