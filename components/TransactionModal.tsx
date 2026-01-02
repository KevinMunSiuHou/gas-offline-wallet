
import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, Calendar } from 'lucide-react';
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
      // Format timestamp to local YYYY-MM-DD
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
    if (type !== TransactionType.TRANSFER && !categoryId) return;
    if (type === TransactionType.TRANSFER && !toWalletId) return;

    // Correct way to create a local date from YYYY-MM-DD input
    const [year, month, day] = date.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const now = new Date();
    selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    const data = {
      walletId,
      toWalletId: type === TransactionType.TRANSFER ? toWalletId : undefined,
      amount: parseFloat(amount),
      type,
      categoryId: type === TransactionType.TRANSFER ? undefined : categoryId,
      date: selectedDate.getTime(),
      note
    };

    if (initialTransaction) {
      onUpdate({ ...data, id: initialTransaction.id });
    } else {
      onAdd(data);
    }

    onClose();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000); 
    } else if (initialTransaction && onDelete) {
      onDelete(initialTransaction.id);
    }
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-all">
      <div className={`w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up max-h-[92vh] flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div className={`sticky top-0 p-6 border-b flex justify-between items-center z-10 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            {initialTransaction ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-200'}`}>
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`flex p-1 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
              {(Object.values(TransactionType) as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    type === t 
                      ? (isDarkMode ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm') 
                      : 'text-gray-500'
                  }`}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">RM</span>
              <input
                autoFocus
                type="number"
                step="0.01"
                placeholder="0.00"
                className={`w-full pl-16 pr-4 py-4 text-4xl font-bold border-none focus:ring-0 rounded-2xl placeholder-gray-300 ${isDarkMode ? 'bg-slate-800 text-gray-100' : 'bg-gray-50 text-gray-800'}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Date</label>
                <div className="relative">
                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                   <input
                    type="date"
                    className={`w-full pl-10 pr-3 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode ? 'bg-slate-800 text-gray-100' : 'bg-gray-50 text-gray-800'}`}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Wallet</label>
                <select
                  className={`w-full p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode ? 'bg-slate-800 text-gray-100' : 'bg-gray-50 text-gray-800'}`}
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  required
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {type === TransactionType.TRANSFER && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">To Wallet</label>
                <select
                  className={`w-full p-3.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode ? 'bg-slate-800 text-gray-100' : 'bg-gray-50 text-gray-800'}`}
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  required
                >
                  {wallets.filter(w => w.id !== walletId).map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            )}

            {type !== TransactionType.TRANSFER && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {filteredCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex flex-col items-center p-2 rounded-xl transition-all border ${
                        categoryId === cat.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : (isDarkMode ? 'border-transparent bg-slate-800' : 'border-transparent bg-gray-50')
                      }`}
                    >
                      <div className="p-2 rounded-full mb-1" style={{ backgroundColor: categoryId === cat.id ? '#3b82f6' : (isDarkMode ? '#334155' : '#f3f4f6'), color: categoryId === cat.id ? 'white' : '#6b7280' }}>
                        {ICON_MAP[cat.iconName]}
                      </div>
                      <span className={`text-[10px] font-medium truncate w-full text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Note</label>
              <input
                type="text"
                placeholder="Details..."
                className={`w-full p-3.5 rounded-xl border-none outline-none transition-all ${isDarkMode ? 'bg-slate-800 text-gray-100 focus:bg-slate-700' : 'bg-gray-50 text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500'}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-blue-700 transition-all active:scale-95"
            >
              {initialTransaction ? 'Update Transaction' : 'Save Record'}
            </button>
          </form>

          {initialTransaction && onDelete && (
            <div className="mt-8 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800">
               <button
                type="button"
                onClick={handleDeleteClick}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 border-2 ${
                  confirmDelete 
                  ? 'bg-red-600 border-red-600 text-white animate-pulse' 
                  : 'bg-transparent border-red-100 dark:border-red-900/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
                }`}
              >
                {confirmDelete ? <AlertTriangle size={20} /> : <Trash2 size={20} />}
                <span>{confirmDelete ? 'Tap again to Confirm Delete' : 'Delete Transaction'}</span>
              </button>
              {confirmDelete && <p className="text-center text-[10px] text-red-400 mt-2 font-bold uppercase tracking-widest">Action is irreversible</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
