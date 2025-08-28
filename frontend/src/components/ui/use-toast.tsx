'use client';

import * as React from 'react';
import { ToastProps } from './toast';

interface ToastContextProps {
  toast(props: ToastProps): void;
}

const ToastContext = React.createContext<ToastContextProps>({
  toast: () => {}
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const toast = (props: ToastProps) => {
    setToasts([...toasts, {...props, id: Date.now().toString()}]);
    setTimeout(() => {
      setToasts(current => current.filter(t => t.id !== props.id));
    }, 5000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}