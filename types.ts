
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export enum Frequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  type: TransactionType;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  type: string;
  color: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  toWalletId?: string;
  amount: number;
  type: TransactionType;
  categoryId?: string;
  date: number; // timestamp
  note: string;
}

export interface Schedule {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  walletId: string;
  frequency: Frequency;
  dayOfMonth?: number; // 1-31
  dayOfWeek?: number; // 0-6 (Sun-Sat)
  nextRun: number; // timestamp
  isActive: boolean;
}

export interface AppState {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  walletTypes: string[];
  schedules: Schedule[];
  isDarkMode: boolean;
}
