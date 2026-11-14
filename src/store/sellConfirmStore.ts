import { create } from 'zustand';

export interface PendingSell {
  towerId?: string;
  towerIds?: string[];
  name: string;
  refund: number;
}

interface SellConfirmStore {
  pending: PendingSell | null;
  openSellConfirm: (pending: PendingSell) => void;
  closeSellConfirm: () => void;
}

export const useSellConfirmStore = create<SellConfirmStore>((set) => ({
  pending: null,
  openSellConfirm: (pending) => set({ pending }),
  closeSellConfirm: () => set({ pending: null }),
}));
