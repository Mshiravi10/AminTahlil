import apiClient from './api-client';
import { DashboardSummary } from '../types';

// API endpoints
const DASHBOARD_ENDPOINT = '/dashboard';

/**
 * Get dashboard summary statistics
 */
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await apiClient.get<DashboardSummary>(`${DASHBOARD_ENDPOINT}/summary`);
  return response.data;
};
