import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../store/theme-store';
import '../../styles/theme.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  
  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/traces/${searchValue.trim()}`);
      setSearchValue('');
    }
  };

  return (
    <header className="border-b py-3 px-6 flex items-center justify-between bg-white shadow-sm" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/')}
          className="text-xl font-bold hover:opacity-80 transition-colors flex items-center"
          style={{ color: 'var(--color-primary-600)' }}
        >
          <img src="/logo.svg" alt="امین‌تحلیل" className="h-8 w-8 ml-2" />
          امین‌تحلیل
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="جستجوی TraceID..." 
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-72 bg-gray-50"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <button
            onClick={handleSearch}
            className="absolute left-1.5 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-gray-200"
            style={{ color: 'var(--color-gray-500)' }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full hover:bg-gray-100 relative"
            style={{ color: 'var(--color-gray-600)' }}
            aria-label="اعلان‌ها"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1.5 right-1.5"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute left-0 mt-2 w-80 rounded-lg shadow-lg bg-white border border-gray-100 p-2 z-50" style={{ marginLeft: '-250px' }}>
              <div className="border-b pb-2 mb-2 flex justify-between items-center">
                <h3 className="font-bold text-sm" style={{ color: 'var(--color-gray-800)' }}>اعلان‌ها</h3>
                <button className="text-xs hover:underline" style={{ color: 'var(--color-primary-600)' }}>علامت‌گذاری همه به عنوان خوانده‌شده</button>
              </div>
              <div className="max-h-80 overflow-y-auto space-y-2">
                <div className="p-2 rounded-md hover:bg-gray-50 border-r-2 border-red-500">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm" style={{ color: 'var(--color-gray-800)' }}>خطای سرویس پرداخت</span>
                    <span className="text-xs" style={{ color: 'var(--color-gray-500)' }}>۳ دقیقه پیش</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-gray-600)' }}>سرویس پرداخت با خطای ۵۰۰ مواجه شده است. لطفاً بررسی کنید.</p>
                </div>
                <div className="p-2 rounded-md hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm" style={{ color: 'var(--color-gray-800)' }}>بروزرسانی سیستم</span>
                    <span className="text-xs" style={{ color: 'var(--color-gray-500)' }}>۱ ساعت پیش</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-gray-600)' }}>نسخه جدید سیستم مانیتورینگ با موفقیت نصب شد.</p>
                </div>
                <div className="p-2 rounded-md hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm" style={{ color: 'var(--color-gray-800)' }}>کندی سرویس احراز هویت</span>
                    <span className="text-xs" style={{ color: 'var(--color-gray-500)' }}>دیروز</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-gray-600)' }}>زمان پاسخگویی سرویس احراز هویت افزایش یافته است.</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t text-center">
                <a href="#" className="text-xs hover:underline" style={{ color: 'var(--color-primary-600)' }}>مشاهده همه اعلان‌ها</a>
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={() => navigate('/comparison')}
          className="p-2 rounded-full hover:bg-gray-100"
          style={{ color: 'var(--color-gray-600)' }}
          aria-label="مقایسه تریس‌ها"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100"
          style={{ color: 'var(--color-gray-600)' }}
          aria-label={theme === 'dark' ? 'روشن کردن تم' : 'تاریک کردن تم'}
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
        
        <div className="border-r mx-2 h-6"></div>
        
        <button className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            کا
          </div>
          <span className="text-sm hidden sm:inline" style={{ color: 'var(--color-gray-700)' }}>کاربر سیستم</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
