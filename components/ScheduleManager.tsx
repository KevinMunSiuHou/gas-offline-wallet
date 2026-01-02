
import React from 'react';
import { Trash2, ToggleLeft, ToggleRight, Calendar as CalendarIcon, ArrowLeft, Plus, Edit2, Play, Clock, PauseCircle, CheckCircle2 } from 'lucide-react';
import { Schedule, Category, Wallet, Frequency } from '../types';
import { ICON_MAP } from '../constants';

interface ScheduleManagerProps {
  schedules: Schedule[];
  categories: Category[];
  wallets: Wallet[];
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onEdit: (schedule: Schedule) => void;
  onRunNow: (schedule: Schedule) => void;
  onAdd: () => void;
  onBack: () => void;
  isDarkMode?: boolean;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({ 
  schedules, categories, wallets, onDelete, onToggle, onEdit, onRunNow, onAdd, onBack, isDarkMode 
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="p-6 space-y-6 pb-40 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all active:scale-90">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black">Schedules</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Auto-pilot Finances</p>
          </div>
        </div>
        <button onClick={onAdd} className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg active:scale-90 transition-all">
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="space-y-4">
        {schedules.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-gray-100 dark:border-slate-800">
            <CalendarIcon size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-gray-400 font-bold text-sm">No scheduled tasks yet</p>
          </div>
        ) : (
          schedules.map(schedule => {
            const category = categories.find(c => c.id === schedule.categoryId);
            const wallet = wallets.find(w => w.id === schedule.walletId);
            const isActive = schedule.isActive;

            return (
              <div 
                key={schedule.id} 
                className={`p-5 rounded-[2rem] border transition-all flex flex-col gap-4 shadow-sm relative overflow-hidden ${
                  isDarkMode 
                    ? `bg-slate-900 ${isActive ? 'border-slate-800' : 'border-slate-800/50 border-dashed opacity-60'}` 
                    : `bg-white ${isActive ? 'border-gray-50' : 'border-gray-200 border-dashed opacity-60'}`
                }`}
              >
                {!isActive && (
                  <div className="absolute top-0 left-0 px-3 py-1 bg-gray-400/10 rounded-br-xl flex items-center gap-1.5">
                    <PauseCircle size={10} className="text-gray-400" />
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Paused</span>
                  </div>
                )}
                {isActive && (
                  <div className="absolute top-0 left-0 px-3 py-1 bg-emerald-500/10 rounded-br-xl flex items-center gap-1.5">
                    <CheckCircle2 size={10} className="text-emerald-500" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center" style={{ 
                      backgroundColor: `${category?.color}15`, 
                      color: category?.color,
                      filter: isActive ? 'none' : 'grayscale(100%)'
                    }}>
                      {category ? ICON_MAP[category.iconName] : <CalendarIcon size={20} />}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className={`font-black text-sm truncate ${!isActive ? 'text-gray-400 line-through' : ''}`}>{schedule.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        <span>{schedule.frequency}</span>
                        <span>•</span>
                        <span className="truncate">{wallet?.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${
                      !isActive ? 'text-gray-400' : 
                      schedule.type === 'INCOME' ? 'text-emerald-500' : 'text-blue-500'
                    }`}>
                      RM {schedule.amount.toFixed(2)}
                    </p>
                    <button onClick={() => onToggle(schedule.id)} className={`transition-all ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
                      {isActive ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                    </button>
                  </div>
                </div>

                <div className={`p-3 rounded-2xl flex items-center justify-between ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      Next: <span className={isActive ? (isDarkMode ? 'text-gray-200' : 'text-gray-700') : 'text-gray-400'}>{formatDate(schedule.nextRun)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => onRunNow(schedule)}
                      title="Run Now"
                      disabled={!isActive}
                      className={`p-2 rounded-lg transition-all active:scale-90 ${
                        isActive 
                        ? 'text-emerald-500 hover:bg-emerald-500/10' 
                        : 'text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <Play size={16} fill="currentColor" />
                    </button>
                    <button 
                      onClick={() => onEdit(schedule)} 
                      className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all active:scale-90"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(schedule.id)} 
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all active:scale-90"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
