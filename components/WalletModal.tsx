
import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Wallet } from '../types';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (wallet: Omit<Wallet, 'id'>) => void;
  onUpdate?: (wallet: Wallet) => void;
  initialWallet?: Wallet | null;
  availableTypes: string[];
}

export const WalletModal: React.FC<WalletModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  onUpdate, 
  initialWallet,
  availableTypes 
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#3b82f6');

  useEffect(() => {
    if (initialWallet) {
      setName(initialWallet.name);
      setType(initialWallet.type);
      setBalance(initialWallet.balance.toString());
      setColor(initialWallet.color);
    } else {
      setName('');
      setType('Bank Account');
      setBalance('');
      setColor('#3b82f6');
    }
  }, [initialWallet, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const walletData = { 
      name: name || type, 
      balance: parseFloat(balance) || 0, 
      type: type || 'Other', 
      color 
    };

    if (initialWallet && onUpdate) {
      onUpdate({ ...walletData, id: initialWallet.id });
    } else {
      onAdd(walletData);
    }
    
    onClose();
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#000000', '#ec4899', '#6366f1'];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">{initialWallet ? 'Edit Wallet' : 'Add Wallet'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Account Type / Category</label>
            <div className="relative group">
              <input
                list="wallet-type-suggestions"
                type="text"
                placeholder="Search or type custom type..."
                className="w-full p-3 rounded-xl bg-gray-50 border border-transparent outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all pr-10"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              <datalist id="wallet-type-suggestions">
                {availableTypes.map(t => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 ml-1">Example: Bank Account, TNG, Wise, Wise USD...</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Account Label / Name</label>
            <input
              type="text"
              placeholder="e.g., Primary Savings"
              className="w-full p-3 rounded-xl bg-gray-50 border border-transparent outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
              {initialWallet ? 'Correct Balance (RM)' : 'Initial Balance (RM)'}
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full p-3 rounded-xl bg-gray-50 border border-transparent outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold focus:bg-white transition-all"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Theme Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all active:scale-95"
          >
            {initialWallet ? 'Update Wallet' : 'Save Wallet'}
          </button>
        </form>
      </div>
    </div>
  );
};
