import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTrace } from '../api/trace-service';
import { Span } from '../types';

const TraceDetail: React.FC = () => {
  const { traceId = '' } = useParams();
  const navigate = useNavigate();
  const [selectedSpan, setSelectedSpan] = useState<Span | null>(null);
  
  const { 
    data: trace, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['trace', traceId],
    queryFn: () => getTrace(traceId),
    enabled: !!traceId
  });
  
  const formatDuration = (microseconds: number) => {
    if (microseconds < 1000) {
      return `${microseconds} μs`;
    } else if (microseconds < 1000000) {
      return `${(microseconds / 1000).toFixed(2)} ms`;
    } else {
      return `${(microseconds / 1000000).toFixed(2)} s`;
    }
  };
  
  // Calculate timing for the Gantt chart visualization
  const calculateTimingPercentage = (span: Span) => {
    if (!trace) return { left: 0, width: 0 };
    
    const traceStartTime = new Date(trace.startTime).getTime();
    const traceEndTime = new Date(trace.endTime).getTime();
    const totalDuration = traceEndTime - traceStartTime;
    
    const spanStartTime = new Date(span.startTime).getTime();
    const spanEndTime = new Date(span.endTime).getTime();
    
    const left = ((spanStartTime - traceStartTime) / totalDuration) * 100;
    const width = ((spanEndTime - spanStartTime) / totalDuration) * 100;
    
    return { left, width };
  };
  
  // Build hierarchical span tree
  const buildSpanTree = (spans: Span[]) => {
    const spanMap = new Map<string, Span & { children: (Span & { children: any[] })[] }>();
    
    // Initialize with empty children arrays
    spans.forEach(span => {
      spanMap.set(span.spanId, { ...span, children: [] });
    });
    
    // Build the tree
    const rootSpans: (Span & { children: any[] })[] = [];
    
    spans.forEach(span => {
      const spanWithChildren = spanMap.get(span.spanId)!;
      
      if (!span.parentSpanId) {
        rootSpans.push(spanWithChildren);
      } else {
        const parent = spanMap.get(span.parentSpanId);
        if (parent) {
          parent.children.push(spanWithChildren);
        } else {
          // If parent not found, treat as root
          rootSpans.push(spanWithChildren);
        }
      }
    });
    
    return rootSpans;
  };
  
  // Recursively render span tree
  const renderSpanTree = (spans: (Span & { children: any[] })[], depth = 0) => {
    return spans.map(span => (
      <React.Fragment key={span.spanId}>
        <div 
          className={`flex items-start py-2 px-4 cursor-pointer hover:bg-muted/50 ${selectedSpan?.spanId === span.spanId ? 'bg-muted' : ''}`}
          onClick={() => setSelectedSpan(span)}
        >
          <div className="flex-1" style={{ paddingRight: `${depth * 20}px` }}>
            <div className="flex items-center">
              {span.children.length > 0 && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
              <span className={`font-medium ${span.hasError ? 'text-destructive' : ''}`}>
                {span.serviceName}
              </span>
              <span className="mx-1 text-muted-foreground">:</span>
              <span className="text-sm">{span.operationName}</span>
            </div>
            <div className="mt-1 flex space-x-2 rtl:space-x-reverse">
              <span className="text-xs text-muted-foreground">{formatDuration(span.duration)}</span>
              {span.hasError && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
                  خطا
                </span>
              )}
            </div>
          </div>
          <div className="w-1/2 h-6 relative bg-muted rounded-sm">
            <div 
              className={`absolute top-0 h-full rounded-sm ${span.hasError ? 'bg-destructive/70' : 'bg-primary/70'}`}
              style={{ 
                right: `${calculateTimingPercentage(span).left}%`,
                width: `${calculateTimingPercentage(span).width}%`
              }}
            />
          </div>
        </div>
        {span.children.length > 0 && renderSpanTree(span.children, depth + 1)}
      </React.Fragment>
    ));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => navigate('/traces')}
            className="text-primary hover:text-primary/90 flex items-center mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            بازگشت به جستجو
          </button>
          <h1 className="text-2xl font-bold">جزئیات تریس</h1>
        </div>
        
        {trace && (
          <div className="flex space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => {
                // Copy trace ID to clipboard
                navigator.clipboard.writeText(traceId);
                alert('شناسه تریس در کلیپبورد کپی شد');
              }}
              className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              کپی TraceID
            </button>
            <button
              onClick={() => {
                // Export trace as JSON
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trace, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", `trace-${traceId}.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
              }}
              className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              دانلود JSON
            </button>
          </div>
        )}
      </div>
      
      {/* Trace Info */}
      {isLoading ? (
        <div className="bg-card rounded-lg shadow border p-8 text-center">
          در حال بارگذاری...
        </div>
      ) : isError ? (
        <div className="bg-card rounded-lg shadow border p-8 text-center text-destructive">
          خطا در دریافت اطلاعات: {(error as Error).message}
        </div>
      ) : trace ? (
        <div className="bg-card rounded-lg shadow border p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">شناسه تریس</h3>
              <p className="mt-1 font-mono text-sm break-all">{trace.traceId}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">سرویس اصلی</h3>
              <p className="mt-1">{trace.rootService}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">زمان شروع</h3>
              <p className="mt-1">{new Date(trace.startTime).toLocaleString('fa-IR')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">مدت زمان کل</h3>
              <p className="mt-1">{formatDuration(trace.duration)}</p>
            </div>
          </div>
        </div>
      ) : null}
      
      {/* Trace Visualization */}
      {trace && (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="bg-card rounded-lg shadow border flex-1 overflow-hidden">
            <div className="p-4 border-b sticky top-0 bg-card z-10">
              <h2 className="text-lg font-medium">ساختار تریس</h2>
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>سرویس و عملیات</span>
                <span>زمان اجرا</span>
              </div>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
              {renderSpanTree(buildSpanTree(trace.spans))}
            </div>
          </div>
          
          {/* Span Details */}
          {selectedSpan && (
            <div className="bg-card rounded-lg shadow border w-full md:w-96">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium">جزئیات اسپن</h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">سرویس</h3>
                  <p className="mt-1">{selectedSpan.serviceName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">عملیات</h3>
                  <p className="mt-1">{selectedSpan.operationName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">مدت زمان</h3>
                  <p className="mt-1">{formatDuration(selectedSpan.duration)}</p>
                </div>
                
                {/* Tags */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">تگ‌ها</h3>
                  {Object.keys(selectedSpan.tags).length === 0 ? (
                    <p className="text-sm text-muted-foreground">بدون تگ</p>
                  ) : (
                    <div className="bg-muted/50 rounded-md p-3 max-h-40 overflow-y-auto">
                      {Object.entries(selectedSpan.tags).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm py-1">
                          <span className="font-medium text-muted-foreground">{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Logs */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">لاگ‌ها</h3>
                  {selectedSpan.logs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">بدون لاگ</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedSpan.logs.map((log, index) => (
                        <div key={index} className="bg-muted/50 rounded-md p-3">
                          <div className="text-xs text-muted-foreground mb-1">
                            {new Date(log.timestamp).toLocaleString('fa-IR')}
                          </div>
                          {Object.entries(log.fields).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm py-0.5">
                              <span className="font-medium text-muted-foreground">{key}:</span>
                              <span className="text-sm">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TraceDetail;
