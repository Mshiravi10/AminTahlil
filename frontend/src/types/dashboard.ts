export interface DashboardSummary {
  totalTraceCount: number;
  errorTraceCount: number;
  errorRate: number;
  averageDuration: number;
  p95Duration: number;
  p99Duration: number;
  serviceCount: number;
  tracesPerMinute: number;
  topServices: ServiceSummary[];
  topErrors: ErrorSummary[];
  latestTraces: TraceSummary[];
}

export interface ServiceSummary {
  name: string;
  callCount: number;
  errorCount: number;
  errorRate: number;
  averageDuration: number;
}

export interface ErrorSummary {
  message: string;
  count: number;
  serviceName: string;
  lastSeen: string;
}

export interface TraceSummary {
  traceId: string;
  rootService: string;
  startTime: string;
  duration: number;
  hasError: boolean;
}
