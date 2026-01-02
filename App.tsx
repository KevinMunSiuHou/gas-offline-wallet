
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Home, PieChart, Plus, Settings, Wallet as WalletIcon, ArrowLeft, Search, ArrowRightLeft, Clock, Download, Upload, ShieldCheck, Loader2, CheckCircle2, Moon, Sun, AlertCircle, RefreshCw, Filter, ArrowUpDown, Tag, CalendarClock, Eye, EyeOff } from 'lucide-react';
import { AppState, Wallet, Transaction, Category, TransactionType, Schedule, Frequency } from './types';
import { storage } from './services/storage';
import { MainDashboard } from './components/MainDashboard';
import { Analytics } from './components/Analytics';
import { TransactionModal } from './components/TransactionModal';
import { WalletModal } from './components/WalletModal';
import { CategoryModal } from './components/CategoryModal';
import { ScheduleModal } from './components/ScheduleModal';
import { ScheduleManager } from './components/ScheduleManager';
import { ICON_MAP } from './constants';

type SortType = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(storage.load());
  const [activeTab, setActiveTab] = useState<'home' | 'analytics' | 'history' | 'settings' | 'schedules'>('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [pendingRestoreData, setPendingRestoreData] = useState<AppState | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<SortType>('date-desc');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Background Scheduler Engine
  const processSchedules = useCallback(() => {
    const nowTimestamp = Date.now();
    let hasChanges = false;
    let newTransactions: Transaction[] = [];
    
    let updatedSchedules = state.schedules.map(schedule => {
      if (!schedule.isActive || schedule.nextRun > nowTimestamp) return schedule;

      let currentNextRun = schedule.nextRun;
      let newSchedule = { ...schedule };

      while (currentNextRun <= nowTimestamp) {
        hasChanges = true;
        const newTx: Transaction = {
          id: `tx-auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          walletId: schedule.walletId,
          amount: schedule.amount,
          type: schedule.type,
          categoryId: schedule.categoryId,
          date: currentNextRun,
          note: `Auto: ${schedule.name}`
        };
        newTransactions.push(newTx);

        // Calculate the actual logical next run date
        const d = new Date(currentNextRun);
        if (schedule.frequency === Frequency.DAILY) {
          d.setDate(d.getDate() + 1);
        } else if (schedule.frequency === Frequency.WEEKLY) {
          d.setDate(d.getDate() + 7);
        } else if (schedule.frequency === Frequency.MONTHLY) {
          const targetDay = schedule.dayOfMonth || 1;
          d.setDate(1); 
          d.setMonth(d.getMonth() + 1);
          const lastDayOfNextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
          d.setDate(Math.min(targetDay, lastDayOfNextMonth));
        }
        currentNextRun = d.getTime();
      }

      newSchedule.nextRun = currentNextRun;
      return newSchedule;
    });

    if (hasChanges) {
      setState(prev => ({
        ...prev,
        transactions: [...newTransactions, ...prev.transactions],
        schedules: updatedSchedules
      }));
    }
  }, [state.schedules]);

  useEffect(() => {
    processSchedules();
  }, []); // Run on mount

  useEffect(() => {
    if (!pendingRestoreData && !isProcessing) {
      storage.save(state);
    }
  }, [state, pendingRestoreData, isProcessing]);

  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  const calculateBalance = useCallback((wallet: Wallet, transactions: Transaction[]) => {
    let balance = wallet.balance; 
    transactions.forEach(tx => {
      if (tx.walletId === wallet.id) {
        if (tx.type === TransactionType.INCOME) balance += tx.amount;
        else if (tx.type === TransactionType.EXPENSE || tx.type === TransactionType.TRANSFER) balance -= tx.amount;
      }
      if (tx.type === TransactionType.TRANSFER && tx.toWalletId === wallet.id) {
        balance += tx.amount;
      }
    });
    return balance;
  }, []);

  const calculatedWallets = useMemo(() => {
    return state.wallets.map(w => ({
      ...w,
      balance: calculateBalance(w, state.transactions)
    }));
  }, [state.wallets, state.transactions, calculateBalance]);

  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  const toggleHideAmounts = () => {
    setState(prev => ({ ...prev, hideAmounts: !prev.hideAmounts }));
  };

  const updateWalletTypes = useCallback((newType: string) => {
    if (!newType) return;
    setState(prev => {
      if (prev.walletTypes.includes(newType)) return prev;
      return {
        ...prev,
        walletTypes: [...prev.walletTypes, newType].sort()
      };
    });
  }, []);

  const handleAddTransaction = useCallback((txData: Omit<Transaction, 'id'>) => {
    const id = `tx-${Date.now()}`;
    const newTx = { ...txData, id };
    setState(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions]
    }));
  }, []);

  const handleUpdateTransaction = useCallback((updatedTx: Transaction) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === updatedTx.id ? updatedTx : t)
    }));
    setEditingTransaction(null);
  }, []);

  const handleDeleteTransaction = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
    setIsTxModalOpen(false);
    setEditingTransaction(null);
  }, []);

  const handleAddWallet = useCallback((w: Omit<Wallet, 'id'>) => {
    const newWallet = { ...w, id: `w-${Date.now()}` };
    updateWalletTypes(w.type);
    setState(prev => ({
      ...prev,
      wallets: [...prev.wallets, newWallet]
    }));
  }, [updateWalletTypes]);

  const handleUpdateWallet = useCallback((updatedWallet: Wallet) => {
    updateWalletTypes(updatedWallet.type);
    setState(prev => ({
      ...prev,
      wallets: prev.wallets.map(w => w.id === updatedWallet.id ? updatedWallet : w)
    }));
    setEditingWallet(null);
  }, [updateWalletTypes]);

  const handleDeleteWallet = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      wallets: prev.wallets.filter(w => w.id !== id)
    }));
    setIsWalletModalOpen(false);
    setEditingWallet(null);
  }, []);

  const handleAddCategory = useCallback((c: Omit<Category, 'id'>) => {
    const newCategory = { ...c, id: `cat-${Date.now()}` };
    setState(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }));
  }, []);

  const handleAddSchedule = useCallback((s: Omit<Schedule, 'id'>) => {
    const newSchedule = { ...s, id: `sch-${Date.now()}` };
    setState(prev => ({
      ...prev,
      schedules: [...prev.schedules, newSchedule]
    }));
  }, []);

  const handleUpdateSchedule = useCallback((updatedSchedule: Schedule) => {
    setState(prev => ({
      ...prev,
      schedules: prev.schedules.map(s => s.id === updatedSchedule.id ? updatedSchedule : s)
    }));
    setEditingSchedule(null);
  }, []);

  const handleRunScheduleNow = useCallback((schedule: Schedule) => {
    const newTx: Transaction = {
      id: `tx-manual-run-${Date.now()}`,
      walletId: schedule.walletId,
      amount: schedule.amount,
      type: schedule.type,
      categoryId: schedule.categoryId,
      date: Date.now(),
      note: `Manual Run: ${schedule.name}`
    };

    const d = new Date(schedule.nextRun);
    if (schedule.frequency === Frequency.DAILY) d.setDate(d.getDate() + 1);
    else if (schedule.frequency === Frequency.WEEKLY) d.setDate(d.getDate() + 7);
    else if (schedule.frequency === Frequency.MONTHLY) {
      const targetDay = schedule.dayOfMonth || 1;
      d.setDate(1); d.setMonth(d.getMonth() + 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(targetDay, lastDay));
    }

    setState(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
      schedules: prev.schedules.map(s => s.id === schedule.id ? { ...s, nextRun: d.getTime() } : s)
    }));
  }, []);

  const handleDeleteSchedule = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      schedules: prev.schedules.filter(s => s.id !== id)
    }));
    setEditingSchedule(null);
  }, []);

  const handleToggleSchedule = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      schedules: prev.schedules.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s)
    }));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessing(true);
      const newData = await storage.importData(file);
      await new Promise(r => setTimeout(r, 600));
      setPendingRestoreData(newData);
    } catch (err) {
      alert('Error Loading File: ' + (err as Error).message);
      setPendingRestoreData(null);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const executeRestore = () => {
    if (!pendingRestoreData) return;
    setIsProcessing(true);
    setTimeout(() => {
      try {
        setState(pendingRestoreData);
        storage.save(pendingRestoreData);
        setPendingRestoreData(null);
        setIsProcessing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setActiveTab('home');
      } catch (err) {
        setIsProcessing(false);
        alert('Restore Failed: ' + (err instanceof Error ? err.message : 'Storage error.'));
      }
    }, 400);
  };

  const filteredHistory = useMemo(() => {
    return state.transactions
      .filter(tx => {
        const categoryName = state.categories.find(c => c.id === tx.categoryId)?.name || '';
        const matchesSearch = tx.note.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              categoryName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => {
        switch (sortType) {
          case 'date-asc': return a.date - b.date;
          case 'amount-desc': return b.amount - a.amount;
          case 'amount-asc': return a.amount - b.amount;
          case 'date-desc':
          default: return b.date - a.date;
        }
      });
  }, [state.transactions, searchQuery, sortType, state.categories]);

  const toggleSort = () => {
    const order: SortType[] = ['date-desc', 'date-asc', 'amount-desc', 'amount-asc'];
    const nextIdx = (order.indexOf(sortType) + 1) % order.length;
    setSortType(order[nextIdx]);
  };

  const getSortLabel = () => {
    switch(sortType) {
      case 'date-desc': return 'Newest';
      case 'date-asc': return 'Oldest';
      case 'amount-desc': return 'Highest';
      case 'amount-asc': return 'Lowest';
    }
  };

  return (
    <div className={`max-w-md mx-auto min-h-screen relative shadow-2xl overflow-hidden flex flex-col transition-colors duration-300 ${state.isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {isProcessing && (
        <div className="fixed inset-0 bg-white/70 dark:bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in duration-300">
            <Loader2 className="text-blue-600 animate-spin" size={56} />
            <p className="font-black text-xl text-slate-800 dark:text-slate-100">Synchronizing...</p>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[101] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
            <CheckCircle2 size={20} />
            <span className="font-bold text-sm">Data Restored Successfully!</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'home' && (
          <MainDashboard 
            wallets={calculatedWallets} 
            transactions={state.transactions} 
            categories={state.categories}
            onAddWallet={() => setIsWalletModalOpen(true)}
            onEditWallet={(w) => { setEditingWallet(w); setIsWalletModalOpen(true); }}
            onEditTransaction={(tx) => { setEditingTransaction(tx); setIsTxModalOpen(true); }}
            onSeeAll={() => setActiveTab('history')}
            isDarkMode={state.isDarkMode}
            hideAmounts={state.hideAmounts}
            onToggleHideAmounts={toggleHideAmounts}
          />
        )}

        {activeTab === 'history' && (
          <div className="p-6 space-y-4 pb-40">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveTab('home')} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500 dark:text-slate-400 active:scale-95 transition-all">
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">History</h1>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 transition-all font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={toggleSort}
                className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-sm border border-blue-100 dark:border-blue-900/40"
              >
                <ArrowUpDown size={14} />
                {getSortLabel()}
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-20 opacity-30 dark:opacity-20 flex flex-col items-center">
                  <Search size={64} className="mb-4 text-slate-300" />
                  <p className="font-bold text-lg">No records found</p>
                </div>
              ) : (
                filteredHistory.map(tx => {
                  const category = state.categories.find(c => c.id === tx.categoryId);
                  const isTransfer = tx.type === TransactionType.TRANSFER;
                  return (
                    <div key={tx.id} onClick={() => { setEditingTransaction(tx); setIsTxModalOpen(true); }} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 cursor-pointer transition-all shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
                          backgroundColor: isTransfer ? (state.isDarkMode ? '#1e293b' : '#f3f4f6') : `${category?.color}15`, 
                          color: isTransfer ? (state.isDarkMode ? '#94a3b8' : '#4b5563') : category?.color 
                        }}>
                          {isTransfer ? <ArrowRightLeft size={18} /> : (category ? ICON_MAP[category.iconName] : <WalletIcon size={18} />)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{isTransfer ? 'Transfer' : (category?.name || 'Uncategorized')}</p>
                          <div className="flex items-center gap-1.5">
                             <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                              {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                            </p>
                            {tx.note && (
                              <>
                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                <p className="text-[10px] text-slate-400 italic truncate max-w-[100px]">{tx.note}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${
                          tx.type === TransactionType.EXPENSE ? 'text-red-500' : 
                          tx.type === TransactionType.INCOME ? 'text-emerald-500' : (state.isDarkMode ? 'text-slate-100' : 'text-slate-900')
                        }`}>
                          {state.hideAmounts ? 'RM ••••' : `${tx.type === TransactionType.EXPENSE ? '-' : tx.type === TransactionType.INCOME ? '+' : ''} RM ${tx.amount.toFixed(2)}`}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && <Analytics transactions={state.transactions} categories={state.categories} isDarkMode={state.isDarkMode} hideAmounts={state.hideAmounts} />}
        
        {activeTab === 'schedules' && (
          <ScheduleManager 
            schedules={state.schedules}
            categories={state.categories}
            wallets={calculatedWallets}
            onDelete={handleDeleteSchedule}
            onToggle={handleToggleSchedule}
            onEdit={(s) => { setEditingSchedule(s); setIsScheduleModalOpen(true); }}
            onRunNow={handleRunScheduleNow}
            onAdd={() => { setEditingSchedule(null); setIsScheduleModalOpen(true); }}
            onBack={() => setActiveTab('settings')}
            isDarkMode={state.isDarkMode}
          />
        )}

        {activeTab === 'settings' && (
          <div className="p-6 space-y-8 pb-40">
             <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">Settings</h1>
             
             {pendingRestoreData && (
               <div className="animate-in slide-in-from-top-4 duration-500 space-y-3">
                 <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 p-5 rounded-[2rem] shadow-xl">
                   <div className="flex gap-3 mb-3">
                     <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0" />
                     <div>
                       <h3 className="font-black text-amber-900 dark:text-amber-100">Backup Loaded</h3>
                       <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Found {pendingRestoreData.wallets.length} wallets.</p>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <button onClick={executeRestore} className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"><RefreshCw size={16} />Restore Now</button>
                     <button onClick={() => setPendingRestoreData(null)} className="px-4 py-3 bg-white dark:bg-slate-800 text-slate-600 rounded-xl font-bold border border-slate-200">Cancel</button>
                   </div>
                 </div>
               </div>
             )}

             <div className="space-y-4">
               <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] px-1">Automation</h3>
               <button onClick={() => setActiveTab('schedules')} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-95">
                 <div className="flex items-center gap-4">
                   <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl"><CalendarClock size={22} /></div>
                   <span className="font-bold text-slate-900 dark:text-slate-100">Recurring Schedules</span>
                 </div>
               </button>
             </div>

             <div className="space-y-4">
               <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] px-1">Privacy</h3>
               <button onClick={toggleHideAmounts} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-95">
                 <div className="flex items-center gap-4">
                   <div className={`p-2.5 rounded-xl ${state.hideAmounts ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'}`}>
                     {state.hideAmounts ? <EyeOff size={22} /> : <Eye size={22} />}
                   </div>
                   <span className="font-bold text-slate-900 dark:text-slate-100">Hide Balances</span>
                 </div>
                 <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${state.hideAmounts ? 'bg-blue-600' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${state.hideAmounts ? 'left-7' : 'left-1'}`} />
                 </div>
               </button>
             </div>

             <div className="space-y-4">
               <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] px-1">Appearance</h3>
               <button onClick={toggleDarkMode} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-95">
                 <div className="flex items-center gap-4">
                   <div className={`p-2.5 rounded-xl ${state.isDarkMode ? 'bg-indigo-900/40 text-indigo-400' : 'bg-amber-50 text-amber-600'}`}>
                     {state.isDarkMode ? <Moon size={22} /> : <Sun size={22} />}
                   </div>
                   <span className="font-bold text-slate-900 dark:text-slate-100">Dark Mode</span>
                 </div>
                 <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${state.isDarkMode ? 'bg-blue-600' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${state.isDarkMode ? 'left-7' : 'left-1'}`} />
                 </div>
               </button>
             </div>

             <div className="space-y-4">
               <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] px-1">Management</h3>
               <button onClick={() => setIsCategoryModalOpen(true)} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-95">
                 <div className="flex items-center gap-4">
                   <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><Settings size={22} /></div>
                   <span className="font-bold text-slate-900 dark:text-slate-100">Categories</span>
                 </div>
               </button>
             </div>

             <div className="space-y-4">
               <div className="flex items-center gap-2 px-1">
                 <ShieldCheck size={16} className="text-emerald-500" />
                 <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Data Safety</h3>
               </div>
               <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
                 <div className="grid grid-cols-1 gap-3">
                   <button onClick={() => storage.exportData()} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-700 dark:text-slate-200 font-black group">
                     <Download size={20} className="text-blue-600" />
                     <span>Download Backup (.json)</span>
                   </button>
                   <button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-700 dark:text-slate-200 font-black">
                     {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} className="text-purple-600" />}
                     <span>Select Backup File</span>
                   </button>
                 </div>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
               </div>
             </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-100 dark:border-slate-800 px-2 py-4 z-40">
        <div className="grid grid-cols-5 items-center">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'home' ? 'text-blue-600 scale-105' : 'text-slate-400'}`}>
            <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'analytics' ? 'text-blue-600 scale-105' : 'text-slate-400'}`}>
            <PieChart size={22} strokeWidth={activeTab === 'analytics' ? 2.5 : 2} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Charts</span>
          </button>
          <div className="flex justify-center -mt-12">
            <button onClick={() => { if (calculatedWallets.length === 0) { setIsWalletModalOpen(true); } else { setEditingTransaction(null); setIsTxModalOpen(true); } }} className="h-16 w-16 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all border-[6px] border-[#f8fafc] dark:border-slate-950">
              <Plus size={32} strokeWidth={3} />
            </button>
          </div>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'history' ? 'text-blue-600 scale-105' : 'text-slate-400'}`}>
            <Clock size={22} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
            <span className="text-[10px] font-black uppercase tracking-tighter">History</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'settings' || activeTab === 'schedules' ? 'text-blue-600 scale-105' : 'text-slate-400'}`}>
            <Settings size={22} strokeWidth={activeTab === 'settings' || activeTab === 'schedules' ? 2.5 : 2} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Set</span>
          </button>
        </div>
      </div>

      <TransactionModal isOpen={isTxModalOpen} onClose={() => { setIsTxModalOpen(false); setEditingTransaction(null); }} onAdd={handleAddTransaction} onUpdate={handleUpdateTransaction} onDelete={handleDeleteTransaction} initialTransaction={editingTransaction} wallets={calculatedWallets} categories={state.categories} isDarkMode={state.isDarkMode} />
      <WalletModal isOpen={isWalletModalOpen} onClose={() => { setIsWalletModalOpen(false); setEditingWallet(null); }} onAdd={handleAddWallet} onUpdate={handleUpdateWallet} onDelete={handleDeleteWallet} initialWallet={editingWallet} availableTypes={state.walletTypes} isDarkMode={state.isDarkMode} />
      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onAdd={handleAddCategory} isDarkMode={state.isDarkMode} />
      <ScheduleModal isOpen={isScheduleModalOpen} onClose={() => { setIsScheduleModalOpen(false); setEditingSchedule(null); }} onSave={handleAddSchedule} onUpdate={handleUpdateSchedule} initialSchedule={editingSchedule} wallets={calculatedWallets} categories={state.categories} isDarkMode={state.isDarkMode} />
    </div>
  );
};

export default App;
