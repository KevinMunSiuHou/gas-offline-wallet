
import { AppState } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

const STORAGE_KEY = 'zenwallet_data';

export const storage = {
  save: (data: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  load: (): AppState => {
    const data = localStorage.getItem(STORAGE_KEY);
    const defaultState: AppState = {
      wallets: [
        { id: 'w-1', name: 'Main Savings', balance: 0, type: 'Bank Account', color: '#3b82f6' }
      ],
      transactions: [],
      schedules: [],
      categories: DEFAULT_CATEGORIES,
      walletTypes: [
        'Bank Account',
        'Touch & Go E-Wallet',
        'Touch & Go Card (NFC)',
        'Wise Account',
        'Cash',
        'Credit Card',
        'Investment Account',
        'Crypto Wallet',
        'ShopeePay',
        'GrabPay'
      ],
      isDarkMode: false
    };

    if (!data) return defaultState;
    
    try {
      const parsed = JSON.parse(data);
      return {
        ...defaultState,
        ...parsed,
        wallets: Array.isArray(parsed.wallets) ? parsed.wallets : defaultState.wallets,
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : defaultState.transactions,
        schedules: Array.isArray(parsed.schedules) ? parsed.schedules : defaultState.schedules,
        categories: Array.isArray(parsed.categories) ? parsed.categories : defaultState.categories,
      };
    } catch (e) {
      return defaultState;
    }
  },
  exportData: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zenwallet_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },
  importData: (file: File): Promise<AppState> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (!content) throw new Error('The selected file is empty.');
          
          const json = JSON.parse(content);
          
          if (!json.wallets && !json.transactions) {
            throw new Error('This file does not appear to be a ZenWallet backup.');
          }

          const current = storage.load();
          const merged: AppState = {
            ...current,
            ...json,
            wallets: Array.isArray(json.wallets) ? json.wallets : current.wallets,
            transactions: Array.isArray(json.transactions) ? json.transactions : current.transactions,
            schedules: Array.isArray(json.schedules) ? json.schedules : current.schedules,
            categories: Array.isArray(json.categories) ? json.categories : current.categories,
          };

          resolve(merged);
        } catch (err) {
          reject(new Error(err instanceof Error ? err.message : 'Failed to parse backup file.'));
        }
      };
      reader.onerror = () => reject(new Error('Could not read the file from your device.'));
      reader.readAsText(file);
    });
  }
};
