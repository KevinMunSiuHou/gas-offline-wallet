
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown, ChevronUp, ListFilter } from 'lucide-react';
import { Transaction, Category, TransactionType } from '../types';
import { ICON_MAP } from '../constants';

interface AnalyticsProps {
  transactions: Transaction[];
  categories: Category[];
  isDarkMode?: boolean;
  hideAmounts?: boolean;
  onCategoryClick?: (catId: string, month: number, year: number) => void;
}

const CustomTooltip = ({ active, payload, label, isDarkMode, hideAmounts }: any) => {
  if (active && payload && payload.length) {
    const formatVal = (val: number) => hideAmounts ? "••••" : `RM ${val.toFixed(2)}`;
    return (
      <div className={`p-3 rounded-2xl shadow-xl border min-w-[140px] pointer-events-none select-none animate-in fade-in zoom-in duration-150 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 border-b pb-1 leading-none">Day {label}</p>
        <div className="space-y-1">
          <div className="flex justify-between items-center gap-4">
            <span className="text-[9px] font-black text-emerald-500 leading-none">INCOME</span>
            <span className={`text-xs font-black ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} leading-none`}>{formatVal(payload.find((p: any) => p.dataKey === 'income')?.value || 0)}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-[9px] font-black text-blue-500 leading-none">EXPENSE</span>
            <span className={`text-xs font-black ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} leading-none`}>{formatVal(payload.find((p: any) => p.dataKey === 'expense')?.value || 0)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const Analytics: React.FC<AnalyticsProps> = ({ transactions, categories, isDarkMode, hideAmounts, onCategoryClick }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => now - 5 + i);
  }, []);

  const handlePrev = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNext = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));
  const handleJumpMonth = (e: React.ChangeEvent<HTMLSelectElement>) => setViewDate(new Date(currentYear, parseInt(e.target.value), 1));
  const handleJumpYear = (e: React.ChangeEvent<HTMLSelectElement>) => setViewDate(new Date(parseInt(e.target.value), currentMonth, 1));
  const resetToToday = () => setViewDate(new Date());

  const monthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

  const expensesOnly = monthTransactions.filter(t => t.type === TransactionType.EXPENSE);
  const totalSpend = expensesOnly.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = monthTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);

  const spendingByCategory = useMemo(() => {
    return categories
      .filter(c => c.type === TransactionType.EXPENSE)
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        value: expensesOnly.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.amount, 0),
        color: cat.color,
        icon: cat.iconName
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [categories, expensesOnly]);

  const displayedBreakdown = isBreakdownExpanded ? spendingByCategory : spendingByCategory.slice(0, 3);

  const trendData = useMemo(() => {
    const days = new Date(currentYear, currentMonth + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const day = i + 1;
      return {
        day: day.toString(),
        expense: expensesOnly.filter(t => new Date(t.date).getDate() === day).reduce((sum, t) => sum + t.amount, 0),
        income: monthTransactions.filter(t => t.type === TransactionType.INCOME && new Date(t.date).getDate() === day).reduce((sum, t) => sum + t.amount, 0)
      };
    });
  }, [currentYear, currentMonth, expensesOnly, monthTransactions]);

  const onCategoryItemClick = (catId: string) => {
    if (onCategoryClick) {
      onCategoryClick(catId, currentMonth, currentYear);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-40 select-none">
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Analysis</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Cashflow Insights</p>
        </div>
        <button 
          onClick={resetToToday} 
          className="h-11 w-11 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 text-blue-600 active:scale-90 transition-all"
        >
          <CalendarIcon size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={handlePrev} className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm text-slate-400 active:scale-90"><ChevronLeft size={22} strokeWidth={3} /></button>
        
        <div className="flex-1 h-14 bg-white dark:bg-slate-900 rounded-2xl shadow-sm px-4 flex items-center gap-2 overflow-hidden border border-slate-50 dark:border-slate-800">
           <div className="flex-1 relative flex items-center justify-center">
             <select 
               value={currentMonth} 
               onChange={handleJumpMonth} 
               className="absolute inset-0 opacity-0 cursor-pointer z-10"
             >
               {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
             </select>
             <span className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest pointer-events-none">
               {months[currentMonth]}
             </span>
             <ChevronDown size={14} className="ml-1 text-slate-300 pointer-events-none" />
           </div>
           <div className="w-[1px] h-6 bg-slate-100 dark:bg-slate-800" />
           <div className="flex-1 relative flex items-center justify-center">
             <select 
               value={currentYear} 
               onChange={handleJumpYear} 
               className="absolute inset-0 opacity-0 cursor-pointer z-10"
             >
               {years.map(y => <option key={y} value={y}>{y}</option>)}
             </select>
             <span className="text-sm font-black text-slate-900 dark:text-slate-100 pointer-events-none">
               {currentYear}
             </span>
             <ChevronDown size={14} className="ml-1 text-slate-300 pointer-events-none" />
           </div>
        </div>

        <button onClick={handleNext} className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm text-slate-400 active:scale-90"><ChevronRight size={22} strokeWidth={3} /></button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Spending Profile + Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spending Profile</h3>
            <div className="flex items-center gap-3">
               <div className="text-right">
                  <p className="text-[9px] font-black text-gray-400 uppercase leading-none">Net Savings</p>
                  <p className={`text-sm font-black leading-none mt-1 ${totalIncome - totalSpend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {hideAmounts ? "•••" : `RM ${(totalIncome - totalSpend).toFixed(0)}`}
                  </p>
               </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Donut Area */}
            <div className="h-48 w-48 flex-shrink-0 relative">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart tabIndex={-1}>
                  <Pie 
                    data={spendingByCategory.length > 0 ? spendingByCategory : [{value: 1, color: isDarkMode ? '#1e293b' : '#f8fafc'}]} 
                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none"
                    isAnimationActive={true}
                    animationDuration={1500}
                  >
                    {spendingByCategory.length > 0 
                      ? spendingByCategory.map((entry, idx) => <Cell key={idx} fill={entry.color} />) 
                      : <Cell fill={isDarkMode ? '#1e293b' : '#f8fafc'} />
                    }
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">Total Expenses</p>
                <p className="text-lg font-black text-gray-900 dark:text-white leading-none">
                  {hideAmounts ? "••••" : `RM ${totalSpend.toFixed(0)}`}
                </p>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="flex-1 w-full space-y-4">
               <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                   <ListFilter size={14} className="text-blue-500" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Breakdown</span>
                 </div>
               </div>
               
               <div className="space-y-3">
                 {spendingByCategory.length === 0 ? (
                   <div className="py-10 text-center border-2 border-dashed border-slate-50 dark:border-slate-800 rounded-3xl">
                     <p className="text-[10px] font-black text-slate-300 uppercase">No expenses recorded</p>
                   </div>
                 ) : (
                   <>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {displayedBreakdown.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => onCategoryItemClick(item.id)}
                          className="bg-slate-50/50 dark:bg-slate-800/50 p-3.5 rounded-2xl flex items-center justify-between border border-transparent active:border-blue-200 dark:active:border-blue-900 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                              {ICON_MAP[item.icon]}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[11px] font-black text-slate-900 dark:text-white leading-none truncate mb-1">{item.name}</p>
                              <div className="flex items-center gap-1.5">
                                <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(item.value / totalSpend) * 100}%`, backgroundColor: item.color }}></div>
                                </div>
                                <p className="text-[8px] text-slate-400 font-bold leading-none">{((item.value / totalSpend) * 100).toFixed(0)}%</p>
                              </div>
                            </div>
                          </div>
                          <p className="text-[11px] font-black text-slate-900 dark:text-white shrink-0 ml-2">RM {hideAmounts ? "•••" : item.value.toFixed(0)}</p>
                        </div>
                       ))}
                     </div>
                     
                     {spendingByCategory.length > 3 && (
                       <button 
                         onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
                         className="w-full h-12 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest active:scale-[0.98] transition-all"
                       >
                         {isBreakdownExpanded ? (
                           <>Show Less <ChevronUp size={14} strokeWidth={3} /></>
                         ) : (
                           <>Show All Categories ({spendingByCategory.length}) <ChevronDown size={14} strokeWidth={3} /></>
                         )}
                       </button>
                     )}
                   </>
                 )}
               </div>
            </div>
          </div>
          
          {/* Summary Footer inside card */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
              <div className="flex flex-col">
                <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Monthly Income</p>
                <p className="text-lg font-black text-emerald-500">RM {hideAmounts ? "••••" : totalIncome.toLocaleString()}</p>
              </div>
              <div className="flex flex-col text-right">
                <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Monthly Expenses</p>
                <p className="text-lg font-black text-blue-600 dark:text-blue-400">RM {hideAmounts ? "••••" : totalSpend.toLocaleString()}</p>
              </div>
          </div>
        </div>

        {/* Daily Flow Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Daily Cashflow</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }} tabIndex={-1}>
                <defs>
                  <linearGradient id="colInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} 
                  padding={{ left: 10, right: 10 }} 
                  interval={4}
                  minTickGap={10}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} hideAmounts={hideAmounts} />} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fill="url(#colInc)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} animationDuration={1000} />
                <Area type="monotone" dataKey="expense" stroke="#3b82f6" strokeWidth={3} fill="url(#colExp)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
