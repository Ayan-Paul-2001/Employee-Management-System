'use client';

import * as React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export type ToastProps = {
  id: string;
  title: string;
  description?: string;
  variant?: 'success' | 'destructive';
};

export function Toast({ title, description, variant = 'success' }: ToastProps) {
  const Icon = variant === 'success' ? CheckCircle2 : XCircle;

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg border ${
      variant === 'success'
        ? 'bg-green-50 border-green-200 text-green-700'
        : 'bg-red-50 border-red-200 text-red-700'
    }`}>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        <div>
          <h3 className="font-medium">{title}</h3>
          {description && <p className="text-sm mt-1">{description}</p>}
        </div>
      </div>
    </div>
  );
}