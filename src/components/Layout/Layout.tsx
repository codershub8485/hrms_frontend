import type { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="w-7xl py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
