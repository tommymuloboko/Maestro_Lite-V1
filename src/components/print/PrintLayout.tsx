import type { ReactNode } from 'react';

interface PrintLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function PrintLayout({ title, subtitle, children }: PrintLayoutProps) {
  return (
    <div className="print-layout p-4">
      <header className="mb-4 border-b pb-2">
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        <p className="text-xs text-gray-500">
          Printed: {new Date().toLocaleString()}
        </p>
      </header>
      <main>{children}</main>
      <footer className="mt-4 border-t pt-2 text-xs text-gray-500 text-center">
        Maestro-Lite
      </footer>
    </div>
  );
}
