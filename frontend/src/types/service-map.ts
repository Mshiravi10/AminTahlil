import { ServiceMap } from './index';

export interface ServiceMapVisualizationResponse {
  serviceMap: ServiceMap;
  layout: ServiceMapLayout;
  statistics: ServiceMapStatistics;
}

export interface ServiceMapLayout {
  nodePositions: Record<string, ServiceMapNodePosition>;
  dimensions: ServiceMapDimensions;
}

export interface ServiceMapNodePosition {
  x: number;
  y: number;
}

export interface ServiceMapDimensions {
  width: number;
  height: number;
}

export interface ServiceMapStatistics {
  serviceCount: number;
  connectionCount: number;
  operationCount: number;
  traceCount: number;
  mostConnectedServices: ServiceConnectionCount[];
  highestErrorRateServices: ServiceErrorRate[];
}

export interface ServiceConnectionCount {
  serviceName: string;
  connectionCount: number;
}

export interface ServiceErrorRate {
  serviceName: string;
  errorRate: number;
}
