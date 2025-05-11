import { Trace } from './index';

export interface TraceComparisonRequest {
  traceIds: string[];
}

export interface TraceComparisonResult {
  traces: Trace[];
  commonServices: string[];
  commonOperations: string[];
  serviceComparison: ServiceComparisonItem[];
  operationComparison: OperationComparisonItem[];
  durationComparison: TraceDurationComparison;
}

export interface ServiceComparisonItem {
  serviceName: string;
  traceDurations: ServiceTraceDuration[];
}

export interface ServiceTraceDuration {
  traceId: string;
  totalDuration: number;
  spanCount: number;
  hasError: boolean;
}

export interface OperationComparisonItem {
  serviceName: string;
  operationName: string;
  traceDurations: OperationTraceDuration[];
}

export interface OperationTraceDuration {
  traceId: string;
  averageDuration: number;
  maxDuration: number;
  spanCount: number;
  hasError: boolean;
}

export interface TraceDurationComparison {
  traceDurations: TraceDurationItem[];
}

export interface TraceDurationItem {
  traceId: string;
  startTime: string;
  endTime: string;
  duration: number;
  spanCount: number;
  serviceCount: number;
  hasError: boolean;
}
