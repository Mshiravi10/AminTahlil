import React, { useState } from 'react';
import { TraceComparisonResult, Trace } from '../../types';
import { formatDuration, formatDateTime, formatPercentage } from '../../utils/formatters';

interface TraceComparisonProps {
  data: TraceComparisonResult | null;
  isLoading: boolean;
  onTraceSelect?: (traceId: string) => void;
}

const TraceComparison: React.FC<TraceComparisonProps> = ({ 
  data, 
  isLoading,
  onTraceSelect
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'operations' | 'overview'>('overview');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  
  if (isLoading) {
    return (
      <div className="p-4 rounded-lg shadow bg-gray-50 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="p-4 text-gray-500">
        اطلاعات مقایسه تریس‌ها در دسترس نیست.
      </div>
    );
  }
  
  // Get trace colors for consistent representation
  const traceColors = [
    { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
    { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  ];
  
  const getTraceColorClass = (index: number, type: 'bg' | 'text' | 'border') => {
    return traceColors[index % traceColors.length][type];
  };
  
  // Functions to render different tabs
  const renderOverview = () => (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Traces Summary */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-700 mb-4">خلاصه تریس‌ها</h3>
          <div className="space-y-4">
            {data.durationComparison.traceDurations.map((trace, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg ${getTraceColorClass(index, 'bg')} ${getTraceColorClass(index, 'border')} border`}
              >
                <div className="flex items-center justify-between">
                  <div 
                    className={`${getTraceColorClass(index, 'text')} font-mono text-sm cursor-pointer hover:underline`}
                    onClick={() => onTraceSelect && onTraceSelect(trace.traceId)}
                  >
                    {trace.traceId.substring(0, 8)}...
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDateTime(trace.startTime)}
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">مدت: </span>
                    {formatDuration(trace.duration)}
                  </div>
                  <div>
                    <span className="font-medium">اسپن‌ها: </span>
                    {trace.spanCount}
                  </div>
                  <div>
                    <span className="font-medium">سرویس‌ها: </span>
                    {trace.serviceCount}
                  </div>
                  <div>
                    <span className="font-medium">وضعیت: </span>
                    {trace.hasError ? (
                      <span className="text-red-600">خطا</span>
                    ) : (
                      <span className="text-green-600">موفق</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Common Features */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-700 mb-4">ویژگی‌های مشترک</h3>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-600 mb-2">سرویس‌های مشترک</h4>
            {data.commonServices.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.commonServices.map((service, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">سرویس مشترکی یافت نشد.</p>
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">عملیات‌های مشترک</h4>
            {data.commonOperations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.commonOperations.map((operation, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-50 rounded-full text-blue-700 text-sm"
                  >
                    {operation}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">عملیات مشترکی یافت نشد.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Duration Comparison Visualization */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-700 mb-4">مقایسه زمان اجرا</h3>
        
        <div className="relative h-24 mb-8">
          {data.durationComparison.traceDurations.map((trace, index) => {
            const maxDuration = Math.max(...data.durationComparison.traceDurations.map(t => t.duration));
            const width = `${(trace.duration / maxDuration) * 100}%`;
            
            return (
              <div key={index} className="mb-4 relative">
                <div className="flex items-center">
                  <div className="w-36 text-sm font-medium">
                    <span 
                      className={`${getTraceColorClass(index, 'text')} cursor-pointer hover:underline`}
                      onClick={() => onTraceSelect && onTraceSelect(trace.traceId)}
                    >
                      {trace.traceId.substring(0, 8)}...
                    </span>
                  </div>
                  <div 
                    className={`h-8 ${getTraceColorClass(index, 'bg')} relative`} 
                    style={{ width }}
                  >
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs font-medium">
                      {formatDuration(trace.duration)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          نکته: برای مشاهده جزئیات هر تریس، روی شناسه آن کلیک کنید.
        </div>
      </div>
    </div>
  );
  
  const renderServiceComparison = () => {
    const filteredComparison = selectedService 
      ? data.serviceComparison.filter(s => s.serviceName === selectedService)
      : data.serviceComparison;
      
    return (
      <div>
        {/* Service filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            فیلتر سرویس:
          </label>
          <select 
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedService || ''}
            onChange={(e) => setSelectedService(e.target.value || null)}
          >
            <option value="">همه سرویس‌ها</option>
            {data.serviceComparison.map((service, index) => (
              <option key={index} value={service.serviceName}>
                {service.serviceName}
              </option>
            ))}
          </select>
        </div>
        
        {/* Service comparison table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  سرویس
                </th>
                {data.traces.map((trace, index) => (
                  <th 
                    key={index} 
                    scope="col" 
                    className={`px-6 py-3 text-right text-xs font-medium ${getTraceColorClass(index, 'text')} uppercase tracking-wider`}
                  >
                    {trace.traceId.substring(0, 8)}...
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComparison.map((service, serviceIndex) => (
                <tr key={serviceIndex}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {service.serviceName}
                  </td>
                  {service.traceDurations.map((duration, traceIndex) => (
                    <td 
                      key={traceIndex} 
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${duration.hasError ? 'bg-red-50' : ''}`}
                    >
                      <div className="space-y-1">
                        <div>{formatDuration(duration.totalDuration)}</div>
                        <div className="text-xs text-gray-400">
                          {duration.spanCount} اسپن
                          {duration.hasError && ' • '}
                          {duration.hasError && <span className="text-red-500">خطا</span>}
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  const renderOperationComparison = () => {
    const filteredComparison = selectedService 
      ? data.operationComparison.filter(o => o.serviceName === selectedService)
      : data.operationComparison;
      
    return (
      <div>
        {/* Service filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            فیلتر سرویس:
          </label>
          <select 
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedService || ''}
            onChange={(e) => setSelectedService(e.target.value || null)}
          >
            <option value="">همه سرویس‌ها</option>
            {Array.from(new Set(data.operationComparison.map(op => op.serviceName))).map((service, index) => (
              <option key={index} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>
        
        {/* Operation comparison table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  سرویس / عملیات
                </th>
                {data.traces.map((trace, index) => (
                  <th 
                    key={index} 
                    scope="col" 
                    className={`px-6 py-3 text-right text-xs font-medium ${getTraceColorClass(index, 'text')} uppercase tracking-wider`}
                  >
                    {trace.traceId.substring(0, 8)}...
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComparison.map((operation, opIndex) => (
                <tr key={opIndex}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{operation.serviceName}</div>
                    <div className="text-sm text-gray-500">{operation.operationName}</div>
                  </td>
                  {operation.traceDurations.map((duration, traceIndex) => (
                    <td 
                      key={traceIndex} 
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${duration.hasError ? 'bg-red-50' : ''}`}
                    >
                      <div className="space-y-1">
                        <div>میانگین: {formatDuration(duration.averageDuration)}</div>
                        <div className="text-xs">حداکثر: {formatDuration(duration.maxDuration)}</div>
                        <div className="text-xs text-gray-400">
                          {duration.spanCount} اسپن
                          {duration.hasError && ' • '}
                          {duration.hasError && <span className="text-red-500">خطا</span>}
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">مقایسه تریس‌ها</h2>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            نمای کلی
          </button>
          <button
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'services'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('services')}
          >
            مقایسه سرویس‌ها
          </button>
          <button
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'operations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('operations')}
          >
            مقایسه عملیات‌ها
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'services' && renderServiceComparison()}
      {activeTab === 'operations' && renderOperationComparison()}
    </div>
  );
};

export default TraceComparison;
