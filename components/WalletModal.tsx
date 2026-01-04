
import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, ChevronDown, CheckCircle2 } from 'lucide-react';
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
  isOpen, onClose, onAdd, onUpdate, onDelete, initialWallet, availableTypes, isDarkMode
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
    const data = { name: name || type, balance: parseFloat(balance) || 0, type: type || 'Other', color };
    initialWallet && onUpdate ? onUpdate({ ...data, id: initialWallet.id }) : onAdd(data);
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    } else if (initialWallet && onDelete) {
      onDelete(initialWallet.id);
      onClose();
    }
  };

  const COLORS = [
    '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981',
    '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316',
    '#ef4444', '#f43f5e', '#ec4899', '#d946ef', '#a855f7',
    '#8b5cf6', '#6366f1', '#64748b', '#475569', '#000000'
  ];
  
  const inputCls = `w-full h-14 px-5 rounded-2xl border-2 border-transparent outline-none transition-all font-black text-sm shadow-sm ${isDarkMode ? 'bg-slate-800 text-white focus:bg-slate-700' : 'bg-slate-50 text-slate-800 focus:bg-white focus:border-blue-100'}`;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 overflow-y-auto"
    >
      <div className={`w-full max-w-sm rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up max-h-[92vh] flex flex-col transition-colors ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div 
          className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}
          style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top))' }}
        >
          <h2 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{initialWallet ? 'Edit Wallet' : 'New Wallet'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all"><X size={24} /></button>
        </div>

        <div className="p-7 space-y-6 overflow-y-auto no-scrollbar pb-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Type</label>
              <div className="relative">
                <input list="types" className={inputCls} value={type} onChange={e => setType(e.target.value)} required placeholder="Bank Account" />
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                <datalist id="types">{availableTypes.map(t => <option key={t} value={t} />)}</datalist>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Wallet Name</label>
              <input className={inputCls} value={name} onChange={e => setName(e.target.value)} required placeholder="Main Savings" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Balance</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">RM</span>
                <input type="number" step="0.01" className={`${inputCls} pl-12`} value={balance} onChange={e => setBalance(e.target.value)} placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Theme Color</label>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map(c => <button key={c} type="button" onClick={() => setColor(c)} className={`w-full aspect-square rounded-xl border-4 transition-all ${color === c ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}
              </div>
            </div>
            
            <button type="submit" className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 active:scale-[0.97] transition-all mt-4 flex items-center justify-center gap-2">
              <CheckCircle2 size={20} />
              <span>{initialWallet ? 'Save Changes' : 'Create Wallet'}</span>
            </button>
          </form>

          {initialWallet && onDelete && (
            <div className="pt-4 border-t border-dashed border-slate-200 dark:border-slate-800">
              <button onClick={handleDelete} className={`w-full h-14 rounded-2xl font-black flex items-center justify-center gap-3 border-2 transition-all active:scale-[0.97] ${confirmDelete ? 'bg-red-600 border-red-600 text-white animate-pulse shadow-lg shadow-red-600/20' : 'bg-transparent border-red-100 dark:border-red-900/10 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'}`}>
                {confirmDelete ? <AlertTriangle size={18} /> : <Trash2 size={18} />}
                <span>{confirmDelete ? 'Tap to Confirm' : 'Delete Account'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
