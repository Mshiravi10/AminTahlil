import apiClient from './api-client';
import { Trace, TraceSearchParams, Span, ServiceMap } from '../types';

// API endpoints
const TRACES_ENDPOINT = '/traces';
const SERVICES_ENDPOINT = '/services';
const ANALYTICS_ENDPOINT = '/analytics';

// Trace services
export const getTrace = async (traceId: string): Promise<Trace> => {
  const response = await apiClient.get<Trace>(`${TRACES_ENDPOINT}/${traceId}`);
  return response.data;
};

export const searchTraces = async (params: TraceSearchParams): Promise<Trace[]> => {
  const response = await apiClient.get<Trace[]>(TRACES_ENDPOINT, { params });
  return response.data;
};

// Service services
export const getServices = async (): Promise<string[]> => {
  const response = await apiClient.get<string[]>(SERVICES_ENDPOINT);
  return response.data;
};

export const getOperations = async (service: string): Promise<string[]> => {
  const response = await apiClient.get<string[]>(`${SERVICES_ENDPOINT}/${service}/operations`);
  return response.data;
};

// Analytics services
export const getErrorTraces = async (limit: number = 10): Promise<Trace[]> => {
  const response = await apiClient.get<Trace[]>(`${ANALYTICS_ENDPOINT}/errors`, {
    params: { limit }
  });
  return response.data;
};

export const getSlowSpans = async (limit: number = 10): Promise<Span[]> => {
  const response = await apiClient.get<Span[]>(`${ANALYTICS_ENDPOINT}/slow-spans`, {
    params: { limit }
  });
  return response.data;
};

export const getServiceMap = async (): Promise<ServiceMap> => {
  const response = await apiClient.get<ServiceMap>(`${ANALYTICS_ENDPOINT}/service-map`);
  return response.data;
};
