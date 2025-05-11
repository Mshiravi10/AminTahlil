import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getErrorTraces, getSlowSpans, getServices } from '../api/trace-service';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Fetch data for dashboard
  const { data: errorTraces = [], isLoading: isLoadingErrors } = useQuery({
    queryKey: ['errorTraces'],
    queryFn: () => getErrorTraces(5)
  });
  
  const { data: slowSpans = [], isLoading: isLoadingSlowSpans } = useQuery({
    queryKey: ['slowSpans'],
    queryFn: () => getSlowSpans(5)
  });
  
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: getServices
  });
  
  // Calculate summary statistics
  const totalServices = services.length;
  const avgDuration = slowSpans.length > 0 
    ? Math.round(slowSpans.reduce((sum, span) => sum + span.duration, 0) / slowSpans.length / 1000) 
    : 0;
  const errorPercentage = errorTraces.length > 0 ? '20%' : '0%'; // Placeholder
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">داشبورد</h1>
        <button
          onClick={() => navigate('/traces')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          جستجوی تریس‌ها
        </button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow p-4 border">
          <h3 className="text-sm font-medium text-muted-foreground">تعداد سرویس‌ها</h3>
          <p className="text-2xl font-bold mt-2">{isLoadingServices ? '...' : totalServices}</p>
        </div>
        
        <div className="bg-card rounded-lg shadow p-4 border">
          <h3 className="text-sm font-medium text-muted-foreground">تعداد خطاها (۲۴ ساعت گذشته)</h3>
          <p className="text-2xl font-bold mt-2 text-destructive">{isLoadingErrors ? '...' : errorTraces.length}</p>
        </div>
        
        <div className="bg-card rounded-lg shadow p-4 border">
          <h3 className="text-sm font-medium text-muted-foreground">میانگین زمان پاسخ</h3>
          <p className="text-2xl font-bold mt-2">{isLoadingSlowSpans ? '...' : `${avgDuration} ms`}</p>
        </div>
        
        <div className="bg-card rounded-lg shadow p-4 border">
          <h3 className="text-sm font-medium text-muted-foreground">درصد خطا</h3>
          <p className="text-2xl font-bold mt-2 text-destructive">{isLoadingErrors ? '...' : errorPercentage}</p>
        </div>
      </div>
      
      {/* Recent Error Traces */}
      <div className="bg-card rounded-lg shadow border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">آخرین خطاها</h2>
        </div>
        <div className="p-4">
          {isLoadingErrors ? (
            <div className="text-center py-4">در حال بارگذاری...</div>
          ) : errorTraces.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">هیچ خطایی یافت نشد</div>
          ) : (
            <div className="space-y-4">
              {errorTraces.map(trace => (
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
                  <div className="text-sm text-muted-foreground">
                    {new Date(trace.startTime).toLocaleTimeString('fa-IR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Slow Spans */}
      <div className="bg-card rounded-lg shadow border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">عملیات‌های کند</h2>
        </div>
        <div className="p-4">
          {isLoadingSlowSpans ? (
            <div className="text-center py-4">در حال بارگذاری...</div>
          ) : slowSpans.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">هیچ عملیات کندی یافت نشد</div>
          ) : (
            <div className="space-y-4">
              {slowSpans.map(span => (
                <div 
                  key={span.spanId}
                  className="p-3 rounded-md bg-muted/50 hover:bg-muted cursor-pointer flex justify-between items-center"
                  onClick={() => navigate(`/traces/${span.traceId}`)}
                >
                  <div>
                    <div className="font-medium">{span.serviceName} - {span.operationName}</div>
                    <div className="text-sm text-muted-foreground">
                      {span.traceId}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {Math.round(span.duration / 1000)} ms
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
