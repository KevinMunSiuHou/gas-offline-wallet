
import { AppState } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

const STORAGE_KEY = 'zenwallet_data';

export const storage = {
  save: (data: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  load: (): AppState => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        wallets: [
          { id: 'w-1', name: 'Main Savings', balance: 0, type: 'Bank Account', color: '#3b82f6' }
        ],
        transactions: [],
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
        ]
      };
    }
    const parsed = JSON.parse(data);
    // Migration for existing users to add walletTypes if missing
    if (!parsed.walletTypes) {
      parsed.walletTypes = [
        'Bank Account', 'Touch & Go E-Wallet', 'Wise Account', 'Cash', 'Credit Card'
      ];
    }
    return parsed;
  }
};
