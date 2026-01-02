
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Wallet, Category, TransactionType, Transaction } from '../types';
import { ICON_MAP } from '../constants';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdate: (transaction: Transaction) => void;
  initialTransaction: Transaction | null;
  wallets: Wallet[];
  categories: Category[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  onUpdate, 
  initialTransaction, 
  wallets, 
  categories 
}) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmount(initialTransaction.amount.toString());
      setWalletId(initialTransaction.walletId);
      setToWalletId(initialTransaction.toWalletId || '');
      setCategoryId(initialTransaction.categoryId || '');
      setNote(initialTransaction.note);
    } else if (isOpen && wallets.length > 0) {
      setType(TransactionType.EXPENSE);
      setAmount('');
      setWalletId(wallets[0].id);
      if (wallets.length > 1) setToWalletId(wallets[1].id);
      setCategoryId('');
      setNote('');
    }
  }, [isOpen, initialTransaction, wallets]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !walletId) return;
    if (type !== TransactionType.TRANSFER && !categoryId) return;
    if (type === TransactionType.TRANSFER && !toWalletId) return;

    const data = {
      walletId,
      toWalletId: type === TransactionType.TRANSFER ? toWalletId : undefined,
      amount: parseFloat(amount),
      type,
      categoryId: type === TransactionType.TRANSFER ? undefined : categoryId,
      date: initialTransaction ? initialTransaction.date : Date.now(),
      note
    };

    if (initialTransaction) {
      onUpdate({ ...data, id: initialTransaction.id });
    } else {
      onAdd(data);
    }

    onClose();
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        <div className="sticky top-0 p-6 border-b flex justify-between items-center bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {initialTransaction ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto no-scrollbar">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(Object.values(TransactionType) as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  type === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
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
              className="w-full pl-16 pr-4 py-4 text-4xl font-bold border-none focus:ring-0 text-gray-800 bg-gray-50 rounded-2xl placeholder-gray-300"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
              {type === TransactionType.TRANSFER ? 'From Wallet' : 'Wallet'}
            </label>
            <select
              className="w-full p-3 rounded-xl border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              required
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name} (RM {w.balance.toFixed(2)})</option>
              ))}
            </select>
          </div>

          {type === TransactionType.TRANSFER && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">To Wallet</label>
              <select
                className="w-full p-3 rounded-xl border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={toWalletId}
                onChange={(e) => setToWalletId(e.target.value)}
                required
              >
                {wallets.filter(w => w.id !== walletId).map(w => (
                  <option key={w.id} value={w.id}>{w.name} (RM {w.balance.toFixed(2)})</option>
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
                      categoryId === cat.id ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-gray-50'
                    }`}
                  >
                    <div className="p-2 rounded-full mb-1" style={{ backgroundColor: categoryId === cat.id ? '#3b82f6' : '#f3f4f6', color: categoryId === cat.id ? 'white' : '#6b7280' }}>
                      {ICON_MAP[cat.iconName]}
                    </div>
                    <span className="text-[10px] font-medium text-gray-600 truncate w-full text-center">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Note (Optional)</label>
            <input
              type="text"
              placeholder="What was this for?"
              className="w-full p-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95"
          >
            {initialTransaction ? 'Update' : (type === TransactionType.TRANSFER ? 'Transfer' : 'Add')}
          </button>
        </form>
      </div>
    </div>
  );
};
