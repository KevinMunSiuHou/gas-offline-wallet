
import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, Calendar, ChevronDown, Wallet as WalletIcon, CheckCircle2 } from 'lucide-react';
import { Wallet, Category, TransactionType, Transaction } from '../types';
import { ICON_MAP } from '../constants';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdate: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  initialTransaction: Transaction | null;
  wallets: Wallet[];
  categories: Category[];
  isDarkMode?: boolean;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  onUpdate, 
  onDelete,
  initialTransaction, 
  wallets, 
  categories,
  isDarkMode
}) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmount(initialTransaction.amount.toString());
      setWalletId(initialTransaction.walletId);
      setToWalletId(initialTransaction.toWalletId || '');
      setCategoryId(initialTransaction.categoryId || '');
      setNote(initialTransaction.note);
      const localDate = new Date(initialTransaction.date);
      const yyyy = localDate.getFullYear();
      const mm = String(localDate.getMonth() + 1).padStart(2, '0');
      const dd = String(localDate.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);
    } else if (isOpen && wallets.length > 0) {
      setType(TransactionType.EXPENSE);
      setAmount('');
      setWalletId(wallets[0].id);
      if (wallets.length > 1) setToWalletId(wallets[1].id);
      setCategoryId('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
    }
    setConfirmDelete(false);
  }, [isOpen, initialTransaction, wallets]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !walletId) return;
    const data = {
      walletId,
      toWalletId: type === TransactionType.TRANSFER ? toWalletId : undefined,
      amount: parseFloat(amount),
      type,
      categoryId: type === TransactionType.TRANSFER ? undefined : categoryId,
      date: new Date(date).getTime(),
      note
    };
    initialTransaction ? onUpdate({ ...data, id: initialTransaction.id }) : onAdd(data);
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); }
    else if (initialTransaction && onDelete) onDelete(initialTransaction.id);
  };

  const filteredCategories = categories.filter(c => c.type === type);
  const inputBase = `w-full h-14 rounded-2xl border-2 border-transparent outline-none transition-all font-bold text-sm shadow-sm ${isDarkMode ? 'bg-slate-800 text-white focus:bg-slate-700' : 'bg-slate-50 text-slate-800 focus:bg-white focus:border-blue-100'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 transition-all">
      <div className={`w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up max-h-[92vh] flex flex-col transition-colors ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div className={`p-6 border-b flex justify-between items-center z-10 ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
          <h2 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{initialTransaction ? 'Edit Transaction' : 'New Record'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`flex p-1.5 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
              {(Object.values(TransactionType) as TransactionType[]).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)} className={`flex-1 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${type === t ? (isDarkMode ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-400'}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">RM</span>
              <input autoFocus type="number" step="0.01" className={`w-full h-20 pl-16 pr-6 text-4xl font-black rounded-2xl border-2 border-transparent transition-all ${isDarkMode ? 'bg-slate-800 text-white focus:bg-slate-700' : 'bg-slate-50 text-slate-900 focus:bg-white focus:border-blue-100'}`} value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0.00" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                <input type="date" className={inputBase + " px-5"} value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Wallet</label>
                <div className="relative">
                  <select className={inputBase + " px-5 pr-10 appearance-none"} value={walletId} onChange={e => setWalletId(e.target.value)} required>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
              </div>
            </div>

            {type === TransactionType.TRANSFER && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To Wallet</label>
                <div className="relative">
                  <select className={inputBase + " px-5 pr-10 appearance-none"} value={toWalletId} onChange={e => setToWalletId(e.target.value)} required>
                    {wallets.filter(w => w.id !== walletId).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
              </div>
            )}

            {type !== TransactionType.TRANSFER && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {filteredCategories.map(cat => (
                    <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${categoryId === cat.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-slate-50 dark:bg-slate-800'}`}>
                      <div className="p-2 rounded-full mb-1" style={{ color: categoryId === cat.id ? '#2563eb' : '#94a3b8' }}>{ICON_MAP[cat.iconName]}</div>
                      <span className="text-[8px] font-black truncate w-full text-center uppercase tracking-tighter">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Note (Optional)</label>
              <input type="text" className={inputBase + " px-5"} value={note} onChange={e => setNote(e.target.value)} placeholder="Lunch, Coffee, etc." />
            </div>

            <button type="submit" className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-all mt-4 flex items-center justify-center gap-2">
              <CheckCircle2 size={20} />
              <span>{initialTransaction ? 'Update Record' : 'Save Transaction'}</span>
            </button>
          </form>

          {initialTransaction && onDelete && (
            <button onClick={handleDelete} className={`w-full h-14 rounded-2xl font-black flex items-center justify-center gap-3 border-2 transition-all active:scale-95 mt-6 ${confirmDelete ? 'bg-red-600 border-red-600 text-white animate-pulse' : 'bg-transparent border-red-50 text-red-500 hover:bg-red-50 dark:border-red-900/10'}`}>
              {confirmDelete ? <AlertTriangle size={18} /> : <Trash2 size={18} />}
              <span>{confirmDelete ? 'Tap to Confirm' : 'Delete Record'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
