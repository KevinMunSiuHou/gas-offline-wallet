
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Transaction, Category, TransactionType } from '../types';
import { ICON_MAP } from '../constants';

interface AnalyticsProps {
  transactions: Transaction[];
  categories: Category[];
  isDarkMode?: boolean;
  hideAmounts?: boolean;
}

const CustomTooltip = ({ active, payload, label, isDarkMode, hideAmounts }: any) => {
  if (active && payload && payload.length) {
    const expense = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
    const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
    const topCat = payload[0]?.payload?.topCategory;

    const formatVal = (val: number) => hideAmounts ? "••••" : `RM ${val.toFixed(2)}`;

    return (
      <div className={`p-4 rounded-2xl shadow-xl border min-w-[160px] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Day {label}</p>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center gap-4">
            <span className="text-[10px] font-bold text-emerald-500">INCOME</span>
            <span className={`text-sm font-black ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatVal(income)}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-[10px] font-bold text-blue-500">EXPENSE</span>
            <span className={`text-sm font-black ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatVal(expense)}</span>
          </div>
          {topCat && expense > 0 && (
            <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-50'}`}>
              <p className="text-[9px] text-gray-400 font-medium uppercase">Major Item</p>
              <p className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{topCat}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const Analytics: React.FC<AnalyticsProps> = ({ transactions, categories, isDarkMode, hideAmounts }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value), 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1));
  };

  const handleCurrentMonth = () => {
    setViewDate(new Date());
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const result = [];
    for (let i = now - 10; i <= now + 2; i++) {
      result.push(i);
    }
    return result;
  }, []);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthTransactions = useMemo(() => {
    const targetMonth = viewDate.getMonth();
    const targetYear = viewDate.getFullYear();
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    });
  }, [transactions, viewDate]);

  const expensesOnly = monthTransactions.filter(t => t.type === TransactionType.EXPENSE);
  const incomeOnly = monthTransactions.filter(t => t.type === TransactionType.INCOME);
  
  const spendingByCategory = useMemo(() => {
    return categories
      .filter(c => c.type === TransactionType.EXPENSE)
      .map(cat => {
        const amount = expensesOnly
          .filter(t => t.categoryId === cat.id)
          .reduce((sum, t) => sum + t.amount, 0);
        return { name: cat.name, value: amount, color: cat.color, icon: cat.iconName };
      })
      .filter(data => data.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [categories, expensesOnly]);

  const trendData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dailyExpenses = expensesOnly.filter(t => new Date(t.date).getDate() === day);
      const dailyIncome = incomeOnly.filter(t => new Date(t.date).getDate() === day);

      const dailyExpenseTotal = dailyExpenses.reduce((sum, t) => sum + t.amount, 0);
      const dailyIncomeTotal = dailyIncome.reduce((sum, t) => sum + t.amount, 0);

      let topCatName = '';
      if (dailyExpenses.length > 0) {
        const catSums: Record<string, number> = {};
        dailyExpenses.forEach(tx => {
          const cat = categories.find(c => c.id === tx.categoryId);
          if (cat) catSums[cat.name] = (catSums[cat.name] || 0) + tx.amount;
        });
        topCatName = Object.entries(catSums).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      }

      return {
        day: day.toString(),
        expense: dailyExpenseTotal,
        income: dailyIncomeTotal,
        topCategory: topCatName
      };
    });
  }, [viewDate, expensesOnly, incomeOnly, categories]);

  const totalMonthlySpend = expensesOnly.reduce((sum, t) => sum + t.amount, 0);
  const totalMonthlyIncome = incomeOnly.reduce((sum, t) => sum + t.amount, 0);
  const netFlow = totalMonthlyIncome - totalMonthlySpend;

  const formatAmountValue = (val: number) => {
    if (hideAmounts) return "••••";
    return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const formatCurrencyValue = (val: number) => {
    if (hideAmounts) return "RM ••••";
    return `RM ${val.toFixed(2)}`;
  };

  return (
    <div className="p-6 space-y-6 pb-40 overflow-x-hidden transition-colors">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">Analysis</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Performance Insights</p>
        </div>
        <button 
          onClick={handleCurrentMonth}
          className="p-3 bg-white dark:bg-slate-900 rounded-2xl border-2 border-transparent shadow-sm hover:shadow-md text-blue-600 dark:text-blue-400 active:scale-95 transition-all"
        >
          <CalendarIcon size={22} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={handlePrevMonth}
          className={`p-4 rounded-2xl border-2 transition-all active:scale-90 shadow-sm ${isDarkMode ? 'bg-slate-900 border-transparent text-slate-400 hover:bg-slate-800' : 'bg-white border-transparent text-gray-500 hover:bg-gray-50'}`}
        >
          <ChevronLeft size={20} strokeWidth={3} />
        </button>
        
        <div className={`flex-1 flex gap-2 p-2 rounded-2xl border-2 transition-all shadow-sm ${isDarkMode ? 'bg-slate-900 border-transparent' : 'bg-white border-transparent'}`}>
          <div className="flex-1 relative group">
            <select 
              value={currentMonth} 
              onChange={handleMonthChange}
              className={`w-full appearance-none bg-transparent py-3 pl-4 pr-10 text-sm font-black outline-none cursor-pointer transition-colors ${isDarkMode ? 'text-slate-100 group-focus-within:text-blue-400' : 'text-slate-900 group-focus-within:text-blue-600'}`}
            >
              {months.map((m, i) => <option key={m} value={i} className={isDarkMode ? 'bg-slate-900 text-white' : ''}>{m}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 transition-colors group-focus-within:text-blue-500" />
          </div>
          
          <div className={`w-[1.5px] my-2 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`} />
          
          <div className="w-28 relative group">
            <select 
              value={currentYear} 
              onChange={handleYearChange}
              className={`w-full appearance-none bg-transparent py-3 pl-4 pr-10 text-sm font-black outline-none cursor-pointer transition-colors ${isDarkMode ? 'text-slate-100 group-focus-within:text-blue-400' : 'text-slate-900 group-focus-within:text-blue-600'}`}
            >
              {years.map(y => <option key={y} value={y} className={isDarkMode ? 'bg-slate-900 text-white' : ''}>{y}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 transition-colors group-focus-within:text-blue-500" />
          </div>
        </div>

        <button 
          onClick={handleNextMonth}
          className={`p-4 rounded-2xl border-2 transition-all active:scale-90 shadow-sm ${isDarkMode ? 'bg-slate-900 border-transparent text-slate-400 hover:bg-slate-800' : 'bg-white border-transparent text-gray-500 hover:bg-gray-50'}`}
        >
          <ChevronRight size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-transparent shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Monthly Profile</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full">
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Analytics</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-6">
          <div className="relative h-32 w-32 sm:h-36 sm:w-36 flex-shrink-0">
             <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                <p className="text-[9px] font-black text-gray-400 leading-none mb-1.5 uppercase tracking-widest">Spending</p>
                <p className="text-sm sm:text-base font-black text-gray-900 dark:text-gray-100">
                  {hideAmounts ? "••••" : `RM ${totalMonthlySpend > 9999 ? (totalMonthlySpend/1000).toFixed(1)+'k' : totalMonthlySpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                </p>
             </div>
             <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={spendingByCategory.length > 0 ? spendingByCategory : [{value: 1, color: isDarkMode ? '#1e293b' : '#f3f4f6'}]}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={58}
                  paddingAngle={spendingByCategory.length > 1 ? 3 : 0}
                  dataKey="value"
                  stroke="none"
                >
                  {spendingByCategory.length > 0 ? (
                    spendingByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))
                  ) : (
                    <Cell fill={isDarkMode ? '#1e293b' : '#f3f4f6'} />
                  )}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 space-y-5">
            <div className="pl-4 border-l-4 border-emerald-500/20">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Income</p>
              <p className="text-lg sm:text-xl font-black text-emerald-500 truncate leading-none">RM {formatAmountValue(totalMonthlyIncome)}</p>
            </div>
            <div className={`pl-4 border-l-4 ${netFlow >= 0 ? 'border-blue-500/20' : 'border-red-500/20'}`}>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Net Cashflow</p>
              <p className={`text-lg sm:text-xl font-black truncate leading-none ${netFlow >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                {netFlow >= 0 ? '+' : ''}RM {formatAmountValue(netFlow)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-transparent shadow-sm">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Cashflow Trends</h3>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: '800' }} 
                dy={12}
                ticks={['1', '10', '20', trendData.length.toString()]}
              />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} hideAmounts={hideAmounts} />} cursor={{ stroke: isDarkMode ? '#334155' : '#e2e8f0', strokeWidth: 2 }} />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorIncome)" 
                animationDuration={1500}
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                stroke="#3b82f6" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorExpense)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-gray-800 dark:text-gray-200 px-1">Top Expenses</h3>
        <div className="grid grid-cols-1 gap-4">
          {spendingByCategory.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-16 rounded-[2.5rem] text-center border-2 border-dashed border-gray-100 dark:border-slate-800 flex flex-col items-center gap-4">
               <CalendarIcon size={48} className="text-slate-200" />
               <p className="text-gray-400 font-black text-sm uppercase tracking-widest italic">Zero History</p>
            </div>
          ) : (
            spendingByCategory.map(item => (
              <div key={item.name} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-transparent flex items-center justify-between group shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                    {ICON_MAP[item.icon]}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-gray-900 dark:text-gray-100">{item.name}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(item.value / totalMonthlySpend) * 100}%`, backgroundColor: item.color }}></div>
                      </div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{((item.value / totalMonthlySpend) * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
                <p className="text-base font-black text-gray-900 dark:text-gray-100">{formatCurrencyValue(item.value)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
