'use client';

import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';

export function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#12182A',
            border: '1px solid #22304F',
            color: '#E6EAF2',
          },
          className: 'font-sans',
        }}
      />
    </>
  );
}

export { toast };
