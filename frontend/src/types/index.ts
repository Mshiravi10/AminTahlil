// Trace types
export interface Trace {
  traceId: string;
  spans: Span[];
  startTime: string;
  endTime: string;
  duration: number;
  rootService: string;
  hasError: boolean;
}

export interface Span {
  spanId: string;
  parentSpanId: string | null;
  traceId: string;
  operationName: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  duration: number;
  tags: Record<string, any>;
  logs: Log[];
  hasError: boolean;
}

export interface Log {
  timestamp: string;
  fields: Record<string, any>;
}

// Search parameters
export interface TraceSearchParams {
  service?: string;
  operation?: string;
  tags?: string;
  minDuration?: number;
  maxDuration?: number;
  startTimeMin?: string;
  startTimeMax?: string;
  limit?: number;
}

// Service Map
export interface ServiceMapNode {
  id: string;
  serviceName: string;
  callCount: number;
  avgDuration: number;
  errorCount: number;
}

export interface ServiceMapEdge {
  source: string;
  target: string;
  callCount: number;
  avgDuration: number;
  errorCount: number;
  operations: string[];
}

export interface ServiceMap {
  nodes: ServiceMapNode[];
  edges: ServiceMapEdge[];
}

// API Error
export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

// Export all type definitions from other files
export * from './dashboard';
export * from './comparison';
export * from './service-map';
