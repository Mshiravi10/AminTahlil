import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import '../../styles/theme.css';

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  return (
    <aside className={`${collapsed ? 'w-20' : 'w-72'} border-l bg-white flex flex-col transition-all duration-300 shadow-md`}>
      <div className="p-6 border-b flex items-center justify-between">
        <div className={`${collapsed ? 'hidden' : 'block'}`}>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary-600)' }}>امین‌تحلیل</h1>
          <p className="text-sm" style={{ color: 'var(--color-gray-600)' }}>سیستم مانیتورینگ توزیع‌شده</p>
        </div>
        {collapsed && (
          <div className="mx-auto">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary-600)' }}>ا‌ت</h1>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-full hover:bg-gray-100"
          style={{ color: 'var(--color-gray-500)' }}
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-3">
          <li>
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => 
                `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' 
                    : 'hover:bg-gray-50 text-gray-700 hover:text-blue-600'
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {!collapsed && 'داشبورد'}
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/traces" 
              className={({ isActive }) => 
                `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' 
                    : 'hover:bg-gray-50 text-gray-700 hover:text-blue-600'
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {!collapsed && 'جستجوی تریس‌ها'}
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/services" 
              className={({ isActive }) => 
                `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' 
                    : 'hover:bg-gray-50 text-gray-700 hover:text-blue-600'
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              {!collapsed && 'تحلیل سرویس‌ها'}
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/service-map" 
              className={({ isActive }) => 
                `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' 
                    : 'hover:bg-gray-50 text-gray-700 hover:text-blue-600'
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              {!collapsed && 'نقشه سرویس‌ها'}
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/comparison" 
              className={({ isActive }) => 
                `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' 
                    : 'hover:bg-gray-50 text-gray-700 hover:text-blue-600'
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {!collapsed && 'مقایسه تریس‌ها'}
            </NavLink>
          </li>
        </ul>
      </nav>
      
      {!collapsed && (
        <div className="p-4 border-t mt-auto">
          <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-100)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: 'var(--color-primary-600)' }} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-medium text-sm mr-2" style={{ color: 'var(--color-gray-800)' }}>راهنمای سریع</h3>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-gray-600)' }}>
              برای جستجوی سریع یک تریس، از فیلد جستجو در بالای صفحه استفاده کنید.
            </p>
            <div className="flex justify-end mt-2">
              <a 
                href="#" 
                className="text-xs font-medium hover:underline" 
                style={{ color: 'var(--color-primary-600)' }}
              >
                مشاهده راهنمای کامل
              </a>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
