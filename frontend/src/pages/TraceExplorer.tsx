import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { searchTraces, getServices, getOperations } from '../api/trace-service';
import { TraceSearchParams } from '../types';

const TraceExplorer: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<TraceSearchParams>({
    limit: 20
  });
  
  // Fetch services for dropdown
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: getServices
  });
  
  // Fetch operations when service is selected
  const { data: operations = [] } = useQuery({
    queryKey: ['operations', searchParams.service],
    queryFn: () => searchParams.service ? getOperations(searchParams.service) : Promise.resolve([]),
    enabled: !!searchParams.service
  });
  
  // Search traces with current params
  const { 
    data: traces = [], 
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['traces', searchParams],
    queryFn: () => searchTraces(searchParams),
    enabled: false // Don't auto-fetch, wait for user to submit
  });
  
  const handleSearch = () => {
    refetch();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value ? parseInt(value) : undefined
    }));
  };
  
  const formatDuration = (microseconds: number) => {
    if (microseconds < 1000) {
      return `${microseconds} μs`;
    } else if (microseconds < 1000000) {
      return `${(microseconds / 1000).toFixed(2)} ms`;
    } else {
      return `${(microseconds / 1000000).toFixed(2)} s`;
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">جستجوی تریس‌ها</h1>
      
      {/* Search Filters */}
      <div className="bg-card rounded-lg shadow p-4 border">
        <h2 className="text-lg font-medium mb-4">فیلترها</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">سرویس</label>
            <select
              name="service"
              value={searchParams.service || ''}
              onChange={handleInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">تمام سرویس‌ها</option>
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">عملیات</label>
            <select
              name="operation"
              value={searchParams.operation || ''}
              onChange={handleInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              disabled={!searchParams.service}
            >
              <option value="">تمام عملیات‌ها</option>
              {operations.map(operation => (
                <option key={operation} value={operation}>{operation}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">حداقل زمان (میکروثانیه)</label>
            <input
              type="number"
              name="minDuration"
              value={searchParams.minDuration || ''}
              onChange={handleNumberInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="مثال: 1000000"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">حداکثر زمان (میکروثانیه)</label>
            <input
              type="number"
              name="maxDuration"
              value={searchParams.maxDuration || ''}
              onChange={handleNumberInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="مثال: 5000000"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">تگ‌ها</label>
            <input
              type="text"
              name="tags"
              value={searchParams.tags || ''}
              onChange={handleInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="مثال: error=true,http.status_code=500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">تعداد نتایج</label>
            <input
              type="number"
              name="limit"
              value={searchParams.limit || 20}
              onChange={handleNumberInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              min={1}
              max={100}
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            جستجو
          </button>
        </div>
      </div>
      
      {/* Search Results */}
      <div className="bg-card rounded-lg shadow border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">نتایج جستجو</h2>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">در حال بارگذاری...</div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              خطا در دریافت اطلاعات: {(error as Error).message}
            </div>
          ) : traces.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              هیچ تریسی یافت نشد. لطفا معیارهای جستجو را تغییر دهید.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-right font-medium text-sm">سرویس</th>
                    <th className="py-3 px-4 text-right font-medium text-sm">Trace ID</th>
                    <th className="py-3 px-4 text-right font-medium text-sm">زمان شروع</th>
                    <th className="py-3 px-4 text-right font-medium text-sm">مدت زمان</th>
                    <th className="py-3 px-4 text-right font-medium text-sm">وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {traces.map(trace => (
                    <tr 
                      key={trace.traceId}
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/traces/${trace.traceId}`)}
                    >
                      <td className="py-3 px-4">{trace.rootService}</td>
                      <td className="py-3 px-4 font-mono text-sm">{trace.traceId.substring(0, 8)}...</td>
                      <td className="py-3 px-4">{new Date(trace.startTime).toLocaleString('fa-IR')}</td>
                      <td className="py-3 px-4">{formatDuration(trace.duration)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          trace.hasError 
                            ? 'bg-destructive/10 text-destructive' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        }`}>
                          {trace.hasError ? 'خطا' : 'موفق'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TraceExplorer;
