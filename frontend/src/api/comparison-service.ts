import apiClient from './api-client';
import { TraceComparisonRequest, TraceComparisonResult } from '../types';

// API endpoints
const COMPARISON_ENDPOINT = '/comparison';

/**
 * Compare multiple traces
 * @param request The comparison request containing trace IDs to compare
 */
export const compareTraces = async (request: TraceComparisonRequest): Promise<TraceComparisonResult> => {
  const response = await apiClient.post<TraceComparisonResult>(`${COMPARISON_ENDPOINT}/traces`, request);
  return response.data;
};
