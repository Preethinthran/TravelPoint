import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AlertColor } from '@mui/material';

// Import the Separate UI Components
import { Toaster } from '../components/common/Toaster';
import { Loader } from '../components/common/Loader';

// 1. Define the Interface (State + Actions)
interface UIContextType {
  // Actions (For you to use in pages)
  showToast: (title: string, message: string, type: AlertColor) => void;
  hideToast: () => void;
  startLoading: (message?: string) => void;
  stopLoading: () => void;

  // State (For the UI components to read)
  toastOpen: boolean;
  toastTitle: string;
  toastMessage: string;
  toastSeverity: AlertColor;
  loaderOpen: boolean;
  loaderMessage: string;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};

// 2. The Provider (Logic Only)
export const UIProvider = ({ children }: { children: ReactNode }) => {
  // --- Toaster Logic ---
  const [toastOpen, setToastOpen] = useState(false);
  const [toastTitle, setTitle] = useState('');
  const [toastMessage, setMessage] = useState('');
  const [toastSeverity, setSeverity] = useState<AlertColor>('success');

  const showToast = (title: string, msg: string, type: AlertColor) => {
    setTitle(title);
    setMessage(msg);
    setSeverity(type);
    setToastOpen(true);
  };

  const hideToast = () => setToastOpen(false);

  // --- Loader Logic ---
  const [loaderOpen, setLoaderOpen] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('');

  const startLoading = (msg: string = '') => {
    setLoaderMessage(msg);
    setLoaderOpen(true);
  };

  const stopLoading = () => setLoaderOpen(false);

  return (
    <UIContext.Provider value={{ 
      showToast, hideToast, toastOpen, toastTitle, toastMessage, toastSeverity,
      startLoading, stopLoading, loaderOpen, loaderMessage
    }}>
      {children}
      <Toaster />
      <Loader />

    </UIContext.Provider>
  );
};