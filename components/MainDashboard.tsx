
import React, { useState, useMemo } from 'react';
import { Plus, Wallet as WalletIcon, ArrowRightLeft, Eye, EyeOff, ChevronDown, ChevronUp, PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
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
  hideAmounts?: boolean;
  onToggleHideAmounts?: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ 
  wallets, 
  transactions, 
  categories, 
  onAddWallet, 
  onEditWallet, 
  onEditTransaction,
  onSeeAll,
  isDarkMode,
  hideAmounts,
  onToggleHideAmounts
}) => {
  const [isWalletsExpanded, setIsWalletsExpanded] = useState(false);
  const totalBalance = wallets.reduce((acc, curr) => acc + curr.balance, 0);
  
  const recentTransactions = [...transactions].sort((a, b) => b.date - a.date).slice(0, 5);
  const visibleWallets = isWalletsExpanded ? wallets : wallets.slice(0, 3);
  
  const getWalletName = (id: string) => wallets.find(w => w.id === id)?.name || 'Deleted Wallet';

  const formatAmount = (amount: number) => {
    if (hideAmounts) return "••••••";
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Distribution Chart Data (Only positive balances)
  const chartData = useMemo(() => {
    return wallets
      .filter(w => w.balance > 0)
      .map(w => ({
        name: w.name,
        value: w.balance,
        color: w.color
      }))
      .sort((a, b) => b.value - a.value);
  }, [wallets]);

  const totalPositiveBalance = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 pb-40">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">PersonalWallet</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Personal Finance</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleHideAmounts}
            className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-90 ${
              isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-600 border border-slate-100'
            }`}
          >
            {hideAmounts ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button 
            onClick={onAddWallet}
            title="Add New Wallet"
            className="h-11 w-11 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-90 transition-all"
          >
             <WalletIcon size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Net Worth Card */}
      <div className={`p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group transition-all duration-500 ${
        isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-black' 
        : 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800'
      }`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 pointer-events-none">
          <WalletIcon size={120} />
        </div>
        <div className="relative z-10">
          <p className="text-blue-100/70 dark:text-slate-400 text-[10px] font-black tracking-widest uppercase mb-1">Total Net Worth</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-medium text-blue-100/80 dark:text-slate-400">RM</span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight truncate max-w-full">
              {formatAmount(totalBalance)}
            </h2>
          </div>
        </div>
      </div>

      {/* Asset Allocation Chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 border border-slate-50 dark:border-slate-800">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <PieIcon size={14} className="text-blue-500" />
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Asset Allocation</h3>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {chartData.length} Source{chartData.length > 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-40 w-40 shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={true}
                    animationDuration={1000}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[8px] font-black text-slate-400 uppercase">Assets</p>
                <p className="text-xs font-black text-slate-900 dark:text-white">Positive</p>
              </div>
            </div>
            
            <div className="flex-1 w-full space-y-2">
              {chartData.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-400 truncate max-w-[100px]">{item.name}</span>
                  </div>
                  <span className="text-slate-900 dark:text-slate-200">
                    {((item.value / totalPositiveBalance) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
              {chartData.length > 4 && (
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest pt-1">
                  + {chartData.length - 4} More Wallets
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
        
        {/* Wallets Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Wallets</h3>
            <button onClick={onAddWallet} className="h-9 px-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95">
              <Plus size={14} strokeWidth={3} /> Add
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {wallets.length === 0 ? (
              <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Add your first wallet</p>
              </div>
            ) : (
              <>
                {visibleWallets.map(wallet => (
                  <div 
                    key={wallet.id} 
                    onClick={() => onEditWallet(wallet)}
                    className="p-4 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0" style={{ backgroundColor: `${wallet.color}15`, color: wallet.color }}>
                          <WalletIcon size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-400 text-[9px] font-black uppercase tracking-tighter leading-none mb-1">{wallet.type}</p>
                          <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate w-40">{wallet.name}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-base font-black ${wallet.balance < 0 ? 'text-red-500' : 'text-slate-900 dark:text-slate-100'}`}>
                          {hideAmounts ? "••••" : `RM ${wallet.balance.toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {wallets.length > 3 && (
                  <button 
                    onClick={() => setIsWalletsExpanded(!isWalletsExpanded)}
                    className="w-full h-14 flex items-center justify-center gap-2 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-50 dark:border-slate-800 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest shadow-sm active:scale-[0.98] transition-all"
                  >
                    {isWalletsExpanded ? (
                      <><ChevronUp size={16} strokeWidth={3} /> See Less</>
                    ) : (
                      <><ChevronDown size={16} strokeWidth={3} /> Show All ({wallets.length})</>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Activity Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Recent Activity</h3>
            <button onClick={onSeeAll} className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">See All</button>
          </div>
          <div className="space-y-2">
            {recentTransactions.length === 0 ? (
              <div className="p-12 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center gap-3">
                <ArrowRightLeft size={32} className="text-slate-100 dark:text-slate-800" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No history yet</p>
              </div>
            ) : (
              recentTransactions.map(tx => {
                const category = categories.find(c => c.id === tx.categoryId);
                const isTransfer = tx.type === TransactionType.TRANSFER;

                return (
                  <div key={tx.id} onClick={() => onEditTransaction(tx)} className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 rounded-[1.25rem] border border-slate-50 dark:border-slate-800 active:scale-[0.98] transition-all cursor-pointer shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ 
                        backgroundColor: isTransfer ? (isDarkMode ? '#1e293b' : '#f3f4f6') : `${category?.color}15`, 
                        color: isTransfer ? (isDarkMode ? '#94a3b8' : '#4b5563') : category?.color 
                      }}>
                        {isTransfer ? <ArrowRightLeft size={18} /> : (category ? ICON_MAP[category.iconName] : <WalletIcon size={18} />)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                          {isTransfer ? 'Transfer' : (category?.name || 'Uncategorized')}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase truncate">
                          {isTransfer ? `From ${getWalletName(tx.walletId)}` : getWalletName(tx.walletId)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${
                        tx.type === TransactionType.EXPENSE ? 'text-red-500' : 
                        tx.type === TransactionType.INCOME ? 'text-emerald-500' : (isDarkMode ? 'text-slate-100' : 'text-slate-900')
                      }`}>
                        {hideAmounts ? 'RM ••••' : `${tx.type === TransactionType.EXPENSE ? '-' : tx.type === TransactionType.INCOME ? '+' : ''} RM ${tx.amount.toFixed(2)}`}
                      </p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase">{new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
