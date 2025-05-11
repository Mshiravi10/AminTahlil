import React from 'react';
import { DashboardSummary as DashboardSummaryType } from '../../types';
import { formatDuration, formatDateTime, formatPercentage } from '../../utils/formatters';

interface DashboardSummaryProps {
  summary: DashboardSummaryType | null;
  isLoading: boolean;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-4 rounded-lg shadow bg-gray-50 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!summary) {
    return <div className="p-4 text-gray-500">اطلاعات داشبورد در دسترس نیست.</div>;
  }

  return (
    <div className="p-4 rounded-lg shadow bg-white">
      <h2 className="text-xl font-bold mb-4 text-gray-800">خلاصه وضعیت</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Traces Card */}
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">کل تریس‌ها</p>
              <p className="text-2xl font-bold text-blue-800">{summary.totalTraceCount.toLocaleString()}</p>
            </div>
            <div className="text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-blue-600 text-sm mt-2">{summary.tracesPerMinute.toFixed(1)} تریس در دقیقه</p>
        </div>
        
        {/* Error Rate Card */}
        <div className="rounded-lg bg-red-50 border border-red-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">نرخ خطا</p>
              <p className="text-2xl font-bold text-red-800">{formatPercentage(summary.errorRate)}</p>
            </div>
            <div className="text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-red-600 text-sm mt-2">{summary.errorTraceCount} تریس با خطا</p>
        </div>
        
        {/* Average Duration Card */}
        <div className="rounded-lg bg-green-50 border border-green-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">میانگین زمان</p>
              <p className="text-2xl font-bold text-green-800">{formatDuration(summary.averageDuration)}</p>
            </div>
            <div className="text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-green-600 text-sm mt-2">P95: {formatDuration(summary.p95Duration)}</p>
        </div>
        
        {/* Services Card */}
        <div className="rounded-lg bg-purple-50 border border-purple-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">سرویس‌ها</p>
              <p className="text-2xl font-bold text-purple-800">{summary.serviceCount}</p>
            </div>
            <div className="text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <p className="text-purple-600 text-sm mt-2">در سیستم توزیع‌شده</p>
        </div>
      </div>
      
      {/* Top Services */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">سرویس‌های پرکاربرد</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نام سرویس
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تعداد فراخوانی
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  میانگین زمان
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نرخ خطا
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary.topServices.map((service, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{service.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{service.callCount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDuration(service.averageDuration)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${service.errorRate > 0.05 ? 'text-red-500' : 'text-gray-500'}`}>
                      {formatPercentage(service.errorRate)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Latest Errors */}
      {summary.topErrors.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">خطاهای اخیر</h3>
          <div className="space-y-2">
            {summary.topErrors.map((error, index) => (
              <div key={index} className="bg-red-50 border border-red-100 rounded p-3">
                <div className="flex justify-between">
                  <span className="font-medium text-red-700">{error.serviceName}</span>
                  <span className="text-sm text-red-500">{formatDateTime(error.lastSeen)}</span>
                </div>
                <p className="text-sm text-red-800 mt-1">{error.message}</p>
                <div className="text-xs text-red-600 mt-1">تعداد: {error.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Latest Traces */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">تریس‌های اخیر</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  شناسه تریس
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  سرویس
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  زمان
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  مدت
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  وضعیت
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary.latestTraces.map((trace, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-blue-600">{trace.traceId.substring(0, 8)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{trace.rootService}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDateTime(trace.startTime)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDuration(trace.duration)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {trace.hasError ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        خطا
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        موفق
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
