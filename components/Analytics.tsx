
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Sector } from 'recharts';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
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

const PieTooltip = ({ active, payload, isDarkMode, hideAmounts }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={`p-3 rounded-2xl shadow-2xl border pointer-events-none select-none animate-in fade-in zoom-in duration-150 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">{data.name}</p>
        <p className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} leading-none`}>
          RM {hideAmounts ? "••••" : data.value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export const Analytics: React.FC<AnalyticsProps> = ({ transactions, categories, isDarkMode, hideAmounts, onCategoryClick }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

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

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  const onTopExpenseClick = (catId: string) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm space-y-6 overflow-visible">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spending Profile</h3>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="h-44 w-44 flex-shrink-0 relative">
               <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 text-center pointer-events-none transition-all duration-150 ${activeIndex !== undefined ? 'opacity-0 scale-90 blur-sm' : 'opacity-100 scale-100'}`}>
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Total</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white leading-none">
                    RM {hideAmounts ? "•••" : (totalSpend > 999 ? (totalSpend/1000).toFixed(1)+'k' : totalSpend.toFixed(0))}
                  </p>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <Pie 
                    data={spendingByCategory.length > 0 ? spendingByCategory : [{value: 1, color: isDarkMode ? '#1e293b' : '#f8fafc'}]} 
                    cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={4} dataKey="value" stroke="none"
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                    tabIndex={-1}
                  >
                    {spendingByCategory.length > 0 ? spendingByCategory.map((entry, idx) => <Cell key={idx} fill={entry.color} style={{ outline: 'none' }} />) : <Cell fill={isDarkMode ? '#1e293b' : '#f8fafc'} />}
                  </Pie>
                  <Tooltip content={<PieTooltip isDarkMode={isDarkMode} hideAmounts={hideAmounts} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-50 dark:border-emerald-900/20">
                <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Income</p>
                <p className="text-xl font-black text-emerald-500">RM {hideAmounts ? "••••" : totalIncome.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-50 dark:border-blue-900/20">
                <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Expenses</p>
                <p className="text-xl font-black text-blue-600 dark:text-blue-400">RM {hideAmounts ? "••••" : totalSpend.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Daily Flow</h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }} tabIndex={-1}>
                <defs>
                  <linearGradient id="colInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} 
                  padding={{ left: 5, right: 5 }} 
                  interval={4} // Force standard spacing: shows day 1, 6, 11, 16, 21, 26...
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} hideAmounts={hideAmounts} />} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fill="url(#colInc)" activeDot={{ r: 6, strokeWidth: 0 }} animationDuration={400} />
                <Area type="monotone" dataKey="expense" stroke="#3b82f6" strokeWidth={3} fill="url(#colExp)" activeDot={{ r: 6, strokeWidth: 0 }} animationDuration={400} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Top Expenses</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {spendingByCategory.map(item => (
            <div 
              key={item.name} 
              onClick={() => onTopExpenseClick(item.id)}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-50 dark:border-slate-800 active:scale-[0.97] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                  {ICON_MAP[item.icon]}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 dark:text-white leading-none mb-1.5">{item.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(item.value / totalSpend) * 100}%`, backgroundColor: item.color }}></div>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold">{((item.value / totalSpend) * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>
              <p className="text-xs font-black text-slate-900 dark:text-white">RM {hideAmounts ? "•••" : item.value.toFixed(0)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
