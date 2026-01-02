
import React, { useState, useEffect, useCallback } from 'react';
import { Home, PieChart, Plus, Settings, Wallet as WalletIcon, ArrowLeft, Search, ArrowRightLeft, Clock } from 'lucide-react';
import { AppState, Wallet, Transaction, Category, TransactionType } from './types';
import { storage } from './services/storage';
import { MainDashboard } from './components/MainDashboard';
import { Analytics } from './components/Analytics';
import { TransactionModal } from './components/TransactionModal';
import { WalletModal } from './components/WalletModal';
import { CategoryModal } from './components/CategoryModal';
import { ICON_MAP } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(storage.load());
  const [activeTab, setActiveTab] = useState<'home' | 'analytics' | 'history' | 'settings'>('home');
  
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    storage.save(state);
  }, [state]);

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
    
    setState(prev => {
      const updatedWallets = prev.wallets.map(w => {
        if (w.id === txData.walletId) {
          let newBalance = w.balance;
          if (txData.type === TransactionType.INCOME) newBalance += txData.amount;
          else if (txData.type === TransactionType.EXPENSE || txData.type === TransactionType.TRANSFER) newBalance -= txData.amount;
          return { ...w, balance: newBalance };
        }
        if (txData.type === TransactionType.TRANSFER && w.id === txData.toWalletId) {
          return { ...w, balance: w.balance + txData.amount };
        }
        return w;
      });

      return {
        ...prev,
        transactions: [newTx, ...prev.transactions],
        wallets: updatedWallets
      };
    });
  }, []);

  const handleUpdateTransaction = useCallback((updatedTx: Transaction) => {
    setState(prev => {
      const oldTx = prev.transactions.find(t => t.id === updatedTx.id);
      if (!oldTx) return prev;

      let wallets = prev.wallets.map(w => {
        let balance = w.balance;
        if (w.id === oldTx.walletId) {
          if (oldTx.type === TransactionType.INCOME) balance -= oldTx.amount;
          else if (oldTx.type === TransactionType.EXPENSE || oldTx.type === TransactionType.TRANSFER) balance += oldTx.amount;
        }
        if (oldTx.type === TransactionType.TRANSFER && w.id === oldTx.toWalletId) {
          balance -= oldTx.amount;
        }
        return { ...w, balance };
      });

      wallets = wallets.map(w => {
        let balance = w.balance;
        if (w.id === updatedTx.walletId) {
          if (updatedTx.type === TransactionType.INCOME) balance += updatedTx.amount;
          else if (updatedTx.type === TransactionType.EXPENSE || updatedTx.type === TransactionType.TRANSFER) balance -= updatedTx.amount;
        }
        if (updatedTx.type === TransactionType.TRANSFER && w.id === updatedTx.toWalletId) {
          balance += updatedTx.amount;
        }
        return { ...w, balance };
      });

      return {
        ...prev,
        transactions: prev.transactions.map(t => t.id === updatedTx.id ? updatedTx : t),
        wallets
      };
    });
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

  const handleAddCategory = useCallback((c: Omit<Category, 'id'>) => {
    const newCategory = { ...c, id: `cat-${Date.now()}` };
    setState(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }));
  }, []);

  const filteredHistory = state.transactions
    .filter(tx => tx.note.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  state.categories.find(c => c.id === tx.categoryId)?.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.date - a.date);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#f8fafc] text-slate-900 relative shadow-2xl overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'home' && (
          <MainDashboard 
            wallets={state.wallets} 
            transactions={state.transactions} 
            categories={state.categories}
            onAddWallet={() => setIsWalletModalOpen(true)}
            onEditWallet={(w) => { setEditingWallet(w); setIsWalletModalOpen(true); }}
            onEditTransaction={(tx) => { setEditingTransaction(tx); setIsTxModalOpen(true); }}
            onSeeAll={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'history' && (
          <div className="p-6 space-y-6 pb-40">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveTab('home')} className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-500">
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold">Transaction History</h1>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search history..." 
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-20 opacity-40">
                  <Clock size={48} className="mx-auto mb-2" />
                  <p>No transactions found</p>
                </div>
              ) : (
                filteredHistory.map(tx => {
                  const category = state.categories.find(c => c.id === tx.categoryId);
                  const isTransfer = tx.type === TransactionType.TRANSFER;
                  return (
                    <div key={tx.id} onClick={() => { setEditingTransaction(tx); setIsTxModalOpen(true); }} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-50 hover:border-blue-100 cursor-pointer transition-all shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
                          backgroundColor: isTransfer ? '#f3f4f6' : `${category?.color}15`, 
                          color: isTransfer ? '#4b5563' : category?.color 
                        }}>
                          {isTransfer ? <ArrowRightLeft size={18} /> : (category ? ICON_MAP[category.iconName] : <WalletIcon size={18} />)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{isTransfer ? 'Transfer' : (category?.name || 'Uncategorized')}</p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            {tx.note ? tx.note : new Date(tx.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className={`text-sm font-black ${
                        tx.type === TransactionType.EXPENSE ? 'text-red-500' : 
                        tx.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-gray-900'
                      }`}>
                        {tx.type === TransactionType.EXPENSE ? '-' : tx.type === TransactionType.INCOME ? '+' : ''} RM {tx.amount.toFixed(2)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && <Analytics transactions={state.transactions} categories={state.categories} />}
        
        {activeTab === 'settings' && (
          <div className="p-6 space-y-6 pb-40">
             <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
             <div className="space-y-4">
               <button onClick={() => setIsCategoryModalOpen(true)} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all active:scale-95">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Settings size={20} /></div>
                   <span className="font-semibold">Manage Categories</span>
                 </div>
               </button>
             </div>
             <div className="pt-10 text-center">
               <p className="text-xs text-gray-400 font-medium">ZenWallet v1.4.0 • Offline Ready</p>
             </div>
          </div>
        )}
      </div>

      {/* Redesigned symmetrical footer */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-xl border-t border-gray-100 px-2 py-4 z-40">
        <div className="grid grid-cols-5 items-center">
          
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-blue-600 scale-105' : 'text-gray-400'}`}>
            <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-tight">Home</span>
          </button>

          <button onClick={() => setActiveTab('analytics')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'analytics' ? 'text-blue-600 scale-105' : 'text-gray-400'}`}>
            <PieChart size={22} strokeWidth={activeTab === 'analytics' ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-tight">Analysis</span>
          </button>

          <div className="flex justify-center -mt-10">
            <button onClick={() => { setEditingTransaction(null); setIsTxModalOpen(true); }} className="h-16 w-16 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all border-[6px] border-[#f8fafc]">
              <Plus size={32} strokeWidth={3} />
            </button>
          </div>

          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-blue-600 scale-105' : 'text-gray-400'}`}>
            <Clock size={22} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-tight">History</span>
          </button>
          
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'settings' ? 'text-blue-600 scale-105' : 'text-gray-400'}`}>
            <Settings size={22} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-tight">Settings</span>
          </button>

        </div>
      </div>

      <TransactionModal 
        isOpen={isTxModalOpen} 
        onClose={() => { setIsTxModalOpen(false); setEditingTransaction(null); }} 
        onAdd={handleAddTransaction}
        onUpdate={handleUpdateTransaction}
        initialTransaction={editingTransaction}
        wallets={state.wallets}
        categories={state.categories}
      />
      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => { setIsWalletModalOpen(false); setEditingWallet(null); }}
        onAdd={handleAddWallet}
        onUpdate={handleUpdateWallet}
        initialWallet={editingWallet}
        availableTypes={state.walletTypes}
      />
      <CategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onAdd={handleAddCategory}
      />
    </div>
  );
};

export default App;
