
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Transaction, Category, TransactionType } from '../types';
import { ICON_MAP } from '../constants';

interface AnalyticsProps {
  transactions: Transaction[];
  categories: Category[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const expense = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
    const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
    const topCat = payload[0]?.payload?.topCategory;

    return (
      <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 min-w-[160px]">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center gap-4">
            <span className="text-[10px] font-bold text-emerald-500">INCOME</span>
            <span className="text-sm font-black text-gray-900">RM {income.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-[10px] font-bold text-blue-500">EXPENSE</span>
            <span className="text-sm font-black text-gray-900">RM {expense.toFixed(2)}</span>
          </div>
          {topCat && expense > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-50">
              <p className="text-[9px] text-gray-400 font-medium">TOP SPEND</p>
              <p className="text-[10px] font-bold text-gray-700">{topCat}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const Analytics: React.FC<AnalyticsProps> = ({ transactions, categories }) => {
  const expensesOnly = transactions.filter(t => t.type === TransactionType.EXPENSE);
  const incomeOnly = transactions.filter(t => t.type === TransactionType.INCOME);
  
  const spendingByCategory = categories
    .filter(c => c.type === TransactionType.EXPENSE)
    .map(cat => {
      const amount = expensesOnly
        .filter(t => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: cat.name, value: amount, color: cat.color, icon: cat.iconName };
    })
    .filter(data => data.value > 0)
    .sort((a, b) => b.value - a.value);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse();

  const trendData = last7Days.map(date => {
    const dailyExpenses = expensesOnly.filter(t => {
      const txDate = new Date(t.date);
      txDate.setHours(0, 0, 0, 0);
      return txDate.getTime() === date.getTime();
    });

    const dailyIncomeTotal = incomeOnly
      .filter(t => {
        const txDate = new Date(t.date);
        txDate.setHours(0, 0, 0, 0);
        return txDate.getTime() === date.getTime();
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const dailyExpenseTotal = dailyExpenses.reduce((sum, t) => sum + t.amount, 0);

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
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      expense: dailyExpenseTotal,
      income: dailyIncomeTotal,
      topCategory: topCatName
    };
  });

  const totalMonthlySpend = expensesOnly.reduce((sum, t) => sum + t.amount, 0);
  const totalMonthlyIncome = incomeOnly.reduce((sum, t) => sum + t.amount, 0);
  const netFlow = totalMonthlyIncome - totalMonthlySpend;

  return (
    <div className="p-6 space-y-6 pb-40 overflow-x-hidden">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Analysis</h1>
        <p className="text-sm text-gray-500">Track your spending habits</p>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Spending Profile</h3>
          <div className="bg-blue-50 px-3 py-1 rounded-full">
            <span className="text-[10px] font-bold text-blue-600">30 Days</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="relative h-28 w-28 sm:h-32 sm:w-32 flex-shrink-0">
             <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 leading-none mb-1">SPENT</p>
                <p className="text-xs sm:text-sm font-black text-gray-900">
                  RM {totalMonthlySpend > 9999 ? (totalMonthlySpend/1000).toFixed(1)+'k' : totalMonthlySpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
             </div>
             <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={spendingByCategory.length > 0 ? spendingByCategory : [{value: 1, color: '#f3f4f6'}]}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={50}
                  paddingAngle={spendingByCategory.length > 1 ? 2 : 0}
                  dataKey="value"
                  stroke="none"
                >
                  {spendingByCategory.length > 0 ? (
                    spendingByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))
                  ) : (
                    <Cell fill="#f3f4f6" />
                  )}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 space-y-4">
            <div className="pl-3 sm:pl-4 border-l-2 border-emerald-100">
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Income</p>
              <p className="text-md sm:text-lg font-black text-emerald-500 truncate">RM {totalMonthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className={`pl-3 sm:pl-4 border-l-2 ${netFlow >= 0 ? 'border-blue-100' : 'border-red-100'}`}>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Net Flow</p>
              <p className={`text-md sm:text-lg font-black truncate ${netFlow >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                {netFlow >= 0 ? '+' : ''}RM {netFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Trends</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: '600' }} 
                dy={10}
              />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorIncome)" 
                animationDuration={1500}
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorExpense)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 px-1">Spending Breakdown</h3>
        <div className="grid grid-cols-1 gap-3">
          {spendingByCategory.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl text-center border border-gray-100">
               <p className="text-gray-400 text-xs font-medium italic">No expenses recorded yet</p>
            </div>
          ) : (
            spendingByCategory.map(item => (
              <div key={item.name} className="bg-white p-4 rounded-2xl border border-gray-50 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                    {ICON_MAP[item.icon]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(item.value / totalMonthlySpend) * 100}%`, backgroundColor: item.color }}></div>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold">{((item.value / totalMonthlySpend) * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-black text-gray-900">RM {item.value.toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
