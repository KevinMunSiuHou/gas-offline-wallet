
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Repeat, Info, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Wallet, Category, TransactionType, Schedule, Frequency } from '../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: Omit<Schedule, 'id'>) => void;
  onUpdate: (schedule: Schedule) => void;
  initialSchedule: Schedule | null;
  wallets: Wallet[];
  categories: Category[];
  isDarkMode?: boolean;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ 
  isOpen, onClose, onSave, onUpdate, initialSchedule, wallets, categories, isDarkMode 
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState<Frequency>(Frequency.MONTHLY);
  const [dayOfMonth, setDayOfMonth] = useState(new Date().getDate());
  const [dayOfWeek, setDayOfWeek] = useState(1);

  useEffect(() => {
    if (initialSchedule) {
      setName(initialSchedule.name);
      setAmount(initialSchedule.amount.toString());
      setType(initialSchedule.type);
      setWalletId(initialSchedule.walletId);
      setCategoryId(initialSchedule.categoryId);
      setFrequency(initialSchedule.frequency);
      if (initialSchedule.dayOfMonth !== undefined) setDayOfMonth(initialSchedule.dayOfMonth);
      if (initialSchedule.dayOfWeek !== undefined) setDayOfWeek(initialSchedule.dayOfWeek);
    } else if (isOpen && wallets.length > 0) {
      setName('');
      setAmount('');
      setType(TransactionType.EXPENSE);
      setWalletId(wallets[0].id);
      setFrequency(Frequency.MONTHLY);
      setDayOfMonth(new Date().getDate());
      const filtered = categories.filter(c => c.type === TransactionType.EXPENSE);
      if (filtered.length > 0) setCategoryId(filtered[0].id);
    }
  }, [isOpen, initialSchedule, wallets, categories]);

  useEffect(() => {
    const currentCat = categories.find(c => c.id === categoryId);
    if (!currentCat || currentCat.type !== type) {
      const firstValid = categories.find(c => c.type === type);
      if (firstValid) {
        setCategoryId(firstValid.id);
      }
    }
  }, [type, categories, categoryId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !walletId || !categoryId) return;

    let nextRun = initialSchedule?.nextRun || Date.now();
    
    const shouldRecalculate = !initialSchedule || 
      initialSchedule.frequency !== frequency || 
      initialSchedule.dayOfMonth !== dayOfMonth || 
      initialSchedule.dayOfWeek !== dayOfWeek;

    if (shouldRecalculate) {
      const now = new Date();
      const calcDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);

      if (frequency === Frequency.MONTHLY) {
        const lastDayOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        calcDate.setDate(Math.min(dayOfMonth, lastDayOfThisMonth));
        if (calcDate < now) {
          calcDate.setDate(1);
          calcDate.setMonth(calcDate.getMonth() + 1);
          const lastDayOfNextMonth = new Date(calcDate.getFullYear(), calcDate.getMonth() + 1, 0).getDate();
          calcDate.setDate(Math.min(dayOfMonth, lastDayOfNextMonth));
        }
      } else if (frequency === Frequency.WEEKLY) {
        const currentDay = now.getDay();
        const diff = (dayOfWeek - currentDay + 7) % 7;
        calcDate.setDate(now.getDate() + (diff === 0 ? 0 : diff));
        if (calcDate < now) calcDate.setDate(calcDate.getDate() + 7);
      } else if (frequency === Frequency.DAILY) {
        if (calcDate < now) calcDate.setDate(calcDate.getDate() + 1);
      }
      nextRun = calcDate.getTime();
    }

    const scheduleData = {
      name,
      amount: parseFloat(amount),
      type,
      walletId,
      categoryId,
      frequency,
      dayOfMonth: frequency === Frequency.MONTHLY ? dayOfMonth : undefined,
      dayOfWeek: frequency === Frequency.WEEKLY ? dayOfWeek : undefined,
      nextRun,
      isActive: initialSchedule ? initialSchedule.isActive : true
    };

    if (initialSchedule) {
      onUpdate({ ...scheduleData, id: initialSchedule.id });
    } else {
      onSave(scheduleData);
    }
    
    onClose();
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className={`w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col transition-colors ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
          <div className="space-y-0.5">
            <h2 className="text-xl font-black">{initialSchedule ? 'Edit Schedule' : 'Add Schedule'}</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Setup recurring automation</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          <div className={`flex p-1.5 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${type === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>EXPENSE</button>
            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${type === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>INCOME</button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
              <input 
                type="text" 
                placeholder="e.g. Monthly Rent" 
                className={`w-full px-5 py-4.5 rounded-2xl border-2 border-transparent outline-none font-bold shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 ${isDarkMode ? 'bg-slate-800 text-gray-100 focus:bg-slate-700' : 'bg-gray-50 focus:bg-white focus:border-blue-100'}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount</label>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400 text-lg">RM</span>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  className={`w-full pl-14 pr-6 py-5 rounded-2xl border-2 border-transparent outline-none font-black text-3xl shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 ${isDarkMode ? 'bg-slate-800 text-gray-100 focus:bg-slate-700' : 'bg-gray-50 focus:bg-white focus:border-blue-100'}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Frequency</label>
              <div className="relative group">
                <select 
                  className={`w-full pl-5 pr-10 py-4.5 rounded-2xl border-2 border-transparent outline-none font-black text-sm appearance-none shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 cursor-pointer ${isDarkMode ? 'bg-slate-800 text-gray-100 focus:bg-slate-700' : 'bg-gray-50 focus:bg-white focus:border-blue-100'}`}
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as Frequency)}
                >
                  <option value={Frequency.DAILY}>Daily</option>
                  <option value={Frequency.WEEKLY}>Weekly</option>
                  <option value={Frequency.MONTHLY}>Monthly</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 transition-colors group-focus-within:text-blue-500" />
              </div>
            </div>
            
            {frequency === Frequency.MONTHLY && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Day of Month</label>
                <input 
                  type="number" min="1" max="31"
                  className={`w-full px-5 py-4.5 rounded-2xl border-2 border-transparent outline-none font-black text-sm shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 ${isDarkMode ? 'bg-slate-800 text-gray-100 focus:bg-slate-700' : 'bg-gray-50 focus:bg-white focus:border-blue-100'}`}
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                />
              </div>
            )}

            {frequency === Frequency.WEEKLY && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Day of Week</label>
                <div className="relative group">
                  <select 
                    className={`w-full pl-5 pr-10 py-4.5 rounded-2xl border-2 border-transparent outline-none font-black text-sm appearance-none shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 cursor-pointer ${isDarkMode ? 'bg-slate-800 text-gray-100 focus:bg-slate-700' : 'bg-gray-50 focus:bg-white focus:border-blue-100'}`}
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                  >
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                    <option value={0}>Sunday</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 transition-colors group-focus-within:text-blue-500" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Wallet</label>
              <div className="relative group">
                <select 
                  className={`w-full pl-5 pr-10 py-4.5 rounded-2xl border-2 border-transparent outline-none font-black text-sm appearance-none shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 cursor-pointer ${isDarkMode ? 'bg-slate-800 text-gray-100 focus:bg-slate-700' : 'bg-gray-50 focus:bg-white focus:border-blue-100'}`}
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                >
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 transition-colors group-focus-within:text-blue-500" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
              <div className="relative group">
                <select 
                  className={`w-full pl-5 pr-10 py-4.5 rounded-2xl border-2 border-transparent outline-none font-black text-sm appearance-none shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 cursor-pointer ${isDarkMode ? 'bg-slate-800 text-gray-100 focus:bg-slate-700' : 'bg-gray-50 focus:bg-white focus:border-blue-100'}`}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 transition-colors group-focus-within:text-blue-500" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all">
            <CheckCircle2 size={20} />
            <span>{initialSchedule ? 'Update Schedule' : 'Start Automation'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
