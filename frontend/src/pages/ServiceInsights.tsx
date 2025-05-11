import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getServices, getOperations, searchTraces } from '../api/trace-service';
import { TraceSearchParams } from '../types';

const ServiceInsights: React.FC = () => {
  const navigate = useNavigate();
  const { service } = useParams();
  const [selectedService, setSelectedService] = useState<string>(service || '');
  
  // Update selected service when route param changes
  useEffect(() => {
    if (service) {
      setSelectedService(service);
    }
  }, [service]);
  
  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: getServices
  });
  
  // Fetch operations for selected service
  const { data: operations = [] } = useQuery({
    queryKey: ['operations', selectedService],
    queryFn: () => selectedService ? getOperations(selectedService) : Promise.resolve([]),
    enabled: !!selectedService
  });
  
  // Fetch traces for selected service
  const { data: traces = [], isLoading: isLoadingTraces } = useQuery({
    queryKey: ['serviceTraces', selectedService],
    queryFn: () => {
      const params: TraceSearchParams = {
        service: selectedService,
        limit: 10
      };
      return searchTraces(params);
    },
    enabled: !!selectedService
  });
  
  // Handle service change
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newService = e.target.value;
    setSelectedService(newService);
    navigate(newService ? `/services/${newService}` : '/services');
  };
  
  // Calculate some service metrics
  const errorCount = traces.filter(t => t.hasError).length;
  const errorPercentage = traces.length > 0 ? Math.round((errorCount / traces.length) * 100) : 0;
  
  // Group traces by operation
  const operationStats = operations.map(operation => {
    const opTraces = traces.filter(t => 
      t.spans.some(s => s.serviceName === selectedService && s.operationName === operation)
    );
    
    const avgDuration = opTraces.length > 0
      ? opTraces.reduce((sum, t) => {
          const span = t.spans.find(s => s.serviceName === selectedService && s.operationName === operation);
          return sum + (span?.duration || 0);
        }, 0) / opTraces.length
      : 0;
    
    const opErrorCount = opTraces.filter(t => t.hasError).length;
    
    return {
      operation,
      count: opTraces.length,
      avgDuration,
      errorCount: opErrorCount
    };
  }).sort((a, b) => b.avgDuration - a.avgDuration);
  
  // Format duration helper
  const formatDuration = (microseconds: number) => {
    if (microseconds < 1000) {
      return `${microseconds.toFixed(2)} μs`;
    } else if (microseconds < 1000000) {
      return `${(microseconds / 1000).toFixed(2)} ms`;
    } else {
      return `${(microseconds / 1000000).toFixed(2)} s`;
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">تحلیل سرویس‌ها</h1>
      
      {/* Service Selector */}
      <div className="bg-card rounded-lg shadow border p-4">
        <div className="max-w-sm">
          <label htmlFor="service-select" className="block text-sm font-medium mb-2">
            انتخاب سرویس
          </label>
          <select
            id="service-select"
            value={selectedService}
            onChange={handleServiceChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="">لطفا یک سرویس انتخاب کنید</option>
            {services.map(svc => (
              <option key={svc} value={svc}>{svc}</option>
            ))}
          </select>
        </div>
      </div>
      
      {selectedService ? (
        <>
          {/* Service Overview */}
          <div className="bg-card rounded-lg shadow border p-4">
            <h2 className="text-lg font-medium mb-4">خلاصه وضعیت سرویس: {selectedService}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-md p-4">
                <h3 className="text-sm font-medium text-muted-foreground">تعداد عملیات‌ها</h3>
                <p className="text-2xl font-bold mt-2">{operations.length}</p>
              </div>
              
              <div className="bg-muted/50 rounded-md p-4">
                <h3 className="text-sm font-medium text-muted-foreground">تعداد تریس‌ها (۲۴ ساعت گذشته)</h3>
                <p className="text-2xl font-bold mt-2">{isLoadingTraces ? '...' : traces.length}</p>
              </div>
              
              <div className="bg-muted/50 rounded-md p-4">
                <h3 className="text-sm font-medium text-muted-foreground">درصد خطا</h3>
                <p className="text-2xl font-bold mt-2 text-destructive">
                  {isLoadingTraces ? '...' : `${errorPercentage}%`}
                </p>
              </div>
            </div>
          </div>
          
          {/* Operations Table */}
          <div className="bg-card rounded-lg shadow border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">عملیات‌های سرویس</h2>
            </div>
            
            <div className="p-4">
              {operations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  هیچ عملیاتی برای این سرویس یافت نشد.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-right font-medium text-sm">نام عملیات</th>
                        <th className="py-3 px-4 text-right font-medium text-sm">تعداد اجرا</th>
                        <th className="py-3 px-4 text-right font-medium text-sm">میانگین زمان</th>
                        <th className="py-3 px-4 text-right font-medium text-sm">تعداد خطا</th>
                      </tr>
                    </thead>
                    <tbody>
                      {operationStats.map(stat => (
                        <tr key={stat.operation} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{stat.operation}</td>
                          <td className="py-3 px-4">{stat.count}</td>
                          <td className="py-3 px-4">{formatDuration(stat.avgDuration)}</td>
                          <td className="py-3 px-4 text-destructive">{stat.errorCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Traces */}
          <div className="bg-card rounded-lg shadow border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">تریس‌های اخیر</h2>
            </div>
            
            <div className="p-4">
              {isLoadingTraces ? (
                <div className="text-center py-8">در حال بارگذاری...</div>
              ) : traces.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  هیچ تریسی برای این سرویس یافت نشد.
                </div>
              ) : (
                <div className="space-y-4">
                  {traces.map(trace => (
                    <div 
                      key={trace.traceId}
                      className="p-3 rounded-md bg-muted/50 hover:bg-muted cursor-pointer flex justify-between items-center"
                      onClick={() => navigate(`/traces/${trace.traceId}`)}
                    >
                      <div>
                        <div className="font-medium">{trace.rootService}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-md">
                          {trace.traceId}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(trace.duration)}
                        </span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          trace.hasError 
                            ? 'bg-destructive/10 text-destructive' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        }`}>
                          {trace.hasError ? 'خطا' : 'موفق'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-card rounded-lg shadow border p-8 text-center">
          <p className="text-muted-foreground">لطفا یک سرویس را از لیست بالا انتخاب کنید.</p>
        </div>
      )}
    </div>
  );
};

export default ServiceInsights;
