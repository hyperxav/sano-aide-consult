
import React from 'react';
import { DesktopNavigation, MobileNavigation } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-medical-light">
      <DesktopNavigation />
      
      {/* Mobile header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold medical-gradient bg-clip-text text-transparent">
          SANO Express
        </h1>
        <MobileNavigation />
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
