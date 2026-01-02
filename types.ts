
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
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
  toWalletId?: string; // Only for transfers
  amount: number;
  type: TransactionType;
  categoryId?: string; // Optional for transfers
  date: number; // timestamp
  note: string;
}

export interface AppState {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  walletTypes: string[];
}
