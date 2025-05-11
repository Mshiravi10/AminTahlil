import apiClient from './api-client';
import { ServiceMap, ServiceMapVisualizationResponse } from '../types';

// API endpoints
const SERVICE_MAP_ENDPOINT = '/service-map';

/**
 * Get the enhanced service map with visualization data
 * @param timeRangeHours Time range in hours to analyze (default: 24 hours)
 */
export const getServiceMapVisualization = async (timeRangeHours: number = 24): Promise<ServiceMapVisualizationResponse> => {
  const response = await apiClient.get<ServiceMapVisualizationResponse>(
    `${SERVICE_MAP_ENDPOINT}/visualization`, 
    { params: { timeRangeHours } }
  );
  return response.data;
};

/**
 * Get filtered service map for specific services
 * @param services List of services to include in the filtered map
 */
export const getFilteredServiceMap = async (services: string[]): Promise<ServiceMap> => {
  const response = await apiClient.post<ServiceMap>(`${SERVICE_MAP_ENDPOINT}/filter`, services);
  return response.data;
};
