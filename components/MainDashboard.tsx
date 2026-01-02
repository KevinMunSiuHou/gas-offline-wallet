
import React from 'react';
import { Plus, Wallet as WalletIcon, ArrowRightLeft, Edit2 } from 'lucide-react';
import { Wallet, Transaction, Category, TransactionType } from '../types';
import { ICON_MAP } from '../constants';

interface MainDashboardProps {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  onAddWallet: () => void;
  onEditWallet: (wallet: Wallet) => void;
  onEditTransaction: (tx: Transaction) => void;
  onSeeAll: () => void;
  isDarkMode?: boolean;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ 
  wallets, 
  transactions, 
  categories, 
  onAddWallet, 
  onEditWallet, 
  onEditTransaction,
  onSeeAll,
  isDarkMode
}) => {
  const totalBalance = wallets.reduce((acc, curr) => acc + curr.balance, 0);
  const recentTransactions = [...transactions].sort((a, b) => b.date - a.date).slice(0, 5);
  const getWalletName = (id: string) => wallets.find(w => w.id === id)?.name || 'Deleted Wallet';

  return (
    <div className="p-6 space-y-8 pb-40">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">ZenWallet</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track your finances offline</p>
        </div>
        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
           <WalletIcon size={20} className="text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      <div className={`p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group transition-all duration-500 ${
        isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-black' 
        : 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800'
      }`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 group-hover:scale-125 transition-all">
          <WalletIcon size={120} />
        </div>
        <p className="text-blue-100/70 dark:text-slate-400 text-sm font-medium tracking-widest uppercase mb-2">Total Net Worth</p>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-medium text-blue-100/80 dark:text-slate-400">RM</span>
          <h2 className="text-4xl font-black tracking-tight">
            {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">My Wallets</h3>
          <button onClick={onAddWallet} className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 py-1.5 px-3 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all">
            <Plus size={14} /> Add
          </button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory px-1 -mx-1">
          {wallets.length === 0 ? (
            <div className="w-full p-8 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-400">No wallets added yet</p>
            </div>
          ) : (
            wallets.map(wallet => (
              <div 
                key={wallet.id} 
                className="relative min-w-[210px] max-w-[230px] p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group snap-start"
              >
                <button 
                  onClick={() => onEditWallet(wallet)}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Edit2 size={14} />
                </button>
                <div className="w-10 h-10 rounded-2xl mb-4 flex items-center justify-center" style={{ backgroundColor: `${wallet.color}15`, color: wallet.color }}>
                   <WalletIcon size={20} />
                </div>
                <p className="text-slate-400 text-[10px] font-bold mb-1 truncate uppercase tracking-widest">{wallet.type}</p>
                <h4 className="text-md font-bold text-slate-900 dark:text-slate-100 truncate mb-1">{wallet.name}</h4>
                <p className="text-lg font-black text-slate-900 dark:text-slate-100">RM {wallet.balance.toFixed(2)}</p>
              </div>
            ))
          )}
          <div className="min-w-[10px] h-full" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Recent Transactions</h3>
          <button onClick={onSeeAll} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">See All</button>
        </div>
        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <p className="text-slate-400 text-sm font-medium">Your expenses will appear here.</p>
            </div>
          ) : (
            recentTransactions.map(tx => {
              const category = categories.find(c => c.id === tx.categoryId);
              const isTransfer = tx.type === TransactionType.TRANSFER;

              return (
                <div key={tx.id} onClick={() => onEditTransaction(tx)} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-50 dark:border-slate-800 group hover:border-blue-100 dark:hover:border-blue-900 cursor-pointer transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ 
                      backgroundColor: isTransfer ? (isDarkMode ? '#1e293b' : '#f3f4f6') : `${category?.color}15`, 
                      color: isTransfer ? (isDarkMode ? '#94a3b8' : '#4b5563') : category?.color 
                    }}>
                      {isTransfer ? <ArrowRightLeft size={20} /> : (category ? ICON_MAP[category.iconName] : <WalletIcon size={20} />)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {isTransfer ? 'Transfer' : (category?.name || 'Uncategorized')}
                      </p>
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter truncate max-w-[120px]">
                        {isTransfer ? `${getWalletName(tx.walletId)} → ${getWalletName(tx.toWalletId!)}` : getWalletName(tx.walletId)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className={`text-sm font-bold ${
                        tx.type === TransactionType.EXPENSE ? 'text-red-500' : 
                        tx.type === TransactionType.INCOME ? 'text-emerald-500' : (isDarkMode ? 'text-slate-100' : 'text-slate-900')
                      }`}>
                        {tx.type === TransactionType.EXPENSE ? '-' : tx.type === TransactionType.INCOME ? '+' : ''} RM {tx.amount.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <Edit2 size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
