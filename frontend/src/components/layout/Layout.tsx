import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
        <footer className="border-t py-3 text-center text-sm text-muted-foreground">
          <p>امین‌تحلیل - سیستم مانیتورینگ و رصد سرویس‌ها</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
