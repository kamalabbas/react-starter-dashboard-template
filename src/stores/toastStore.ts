import { create } from 'zustand';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
  persist: boolean,
  linkText: string,
  linkURL: string,
  showToast: (message: string, type?: 'success' | 'error', persist?: boolean, linkText?: string, linkURL?: string) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  type: 'error',
  persist: false,
  linkText: '',
  linkURL: '',
  showToast: (message, type = 'error', persist = false, linkText?, linkURL?) => set({ visible: true, message, type, persist, linkText, linkURL }),
  hideToast: () => set({ visible: false, message: '', type: 'error' }),
}));
