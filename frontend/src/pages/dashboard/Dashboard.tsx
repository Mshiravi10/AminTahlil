import React, { useEffect, useState } from 'react';
import { getDashboardSummary } from '../../api/dashboard-service';
import { DashboardSummary as DashboardSummaryType } from '../../types';
import DashboardSummary from '../../components/dashboard/DashboardSummary';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getDashboardSummary();
        setSummary(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('خطا در دریافت اطلاعات داشبورد. لطفاً صفحه را مجدداً بارگذاری کنید.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleTraceClick = (traceId: string) => {
    navigate(`/traces/${traceId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">داشبورد</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <DashboardSummary 
        summary={summary} 
        isLoading={isLoading} 
      />
      
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>اطلاعات به صورت خودکار هر 30 ثانیه بروزرسانی می‌شود.</p>
        <p>آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}</p>
      </div>
    </div>
  );
};

export default Dashboard;
