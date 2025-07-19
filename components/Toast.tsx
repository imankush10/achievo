'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const getToastStyles = (type: ToastType) => {
    const baseStyles = "glass-panel border-l-4 transform transition-all duration-300 ease-out";
    switch (type) {
      case 'success':
        return `${baseStyles} border-green-500 bg-green-900/20`;
      case 'error':
        return `${baseStyles} border-red-500 bg-red-900/20`;
      case 'warning':
        return `${baseStyles} border-yellow-500 bg-yellow-900/20`;
      default:
        return `${baseStyles} border-blue-500 bg-blue-900/20`;
    }
  };

  const getIcon = (type: ToastType) => {
    const iconClass = "w-5 h-5 mr-3 flex-shrink-0";
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClass} text-green-400`} />;
      case 'error':
        return <ExclamationTriangleIcon className={`${iconClass} text-red-400`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-400`} />;
      default:
        return <InformationCircleIcon className={`${iconClass} text-blue-400`} />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${getToastStyles(toast.type)} animate-slide-in-right`}
          >
            <div className="flex items-center p-4">
              {getIcon(toast.type)}
              <p className="flex-1 text-sm font-medium text-white">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
