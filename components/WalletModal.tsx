
import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, ChevronDown } from 'lucide-react';
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

  const inputClasses = `w-full h-14 px-5 rounded-2xl border-2 border-transparent outline-none transition-all font-black text-sm shadow-sm focus:ring-4 focus:ring-blue-500/10 ${isDarkMode ? 'bg-slate-800 text-gray-100 focus:bg-slate-700' : 'bg-gray-50 text-gray-800 focus:bg-white focus:border-blue-100'}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
          <h2 className={`text-xl font-black ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            {initialWallet ? 'Edit Wallet' : 'Add Wallet'}
          </h2>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Type</label>
              <div className="relative group">
                <input
                  list="wallet-type-suggestions"
                  type="text"
                  placeholder="e.g. Bank Account"
                  className={`${inputClasses} pr-12`}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                />
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-blue-500" size={18} />
                <datalist id="wallet-type-suggestions">
                  {availableTypes.map(t => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Wallet Name</label>
              <input
                type="text"
                placeholder="e.g. My Savings"
                className={inputClasses}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Balance</label>
              <div className="relative">
                 <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm">RM</span>
                 <input
                  type="number"
                  step="0.01"
                  className={`${inputClasses} pl-12`}
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Theme Color</label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-2xl border-4 transition-all active:scale-90 shadow-sm ${color === c ? 'border-gray-900/10 dark:border-white/20 scale-110 shadow-md ring-2 ring-blue-500/30' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] mt-6"
            >
              {initialWallet ? 'Update Details' : 'Create Wallet'}
            </button>
          </form>

          {initialWallet && onDelete && (
            <div className="pt-6 border-t border-dashed border-slate-200 dark:border-slate-800">
               <button
                type="button"
                onClick={handleDeleteClick}
                className={`w-full h-14 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] border-2 shadow-sm ${
                  confirmDelete 
                  ? 'bg-red-600 border-red-600 text-white animate-pulse' 
                  : 'bg-transparent border-red-100 dark:border-red-900/10 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
                }`}
              >
                {confirmDelete ? <AlertTriangle size={20} /> : <Trash2 size={20} />}
                <span>{confirmDelete ? 'Confirm Deletion' : 'Delete Account'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
