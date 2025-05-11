import apiClient from './api-client';

// API endpoints
const EXPORT_ENDPOINT = '/export';

/**
 * Export a trace as JSON
 * @param traceId The ID of the trace to export
 * @returns A URL to download the JSON file
 */
export const exportTraceAsJson = (traceId: string): string => {
  return `${apiClient.defaults.baseURL}${EXPORT_ENDPOINT}/trace/${traceId}/json`;
};

/**
 * Export a trace as CSV
 * @param traceId The ID of the trace to export
 * @returns A URL to download the CSV file
 */
export const exportTraceAsCsv = (traceId: string): string => {
  return `${apiClient.defaults.baseURL}${EXPORT_ENDPOINT}/trace/${traceId}/csv`;
};

/**
 * Generate a report for a trace
 * @param traceId The ID of the trace
 * @returns A URL to download the HTML report
 */
export const generateTraceReport = (traceId: string): string => {
  return `${apiClient.defaults.baseURL}${EXPORT_ENDPOINT}/trace/${traceId}/report`;
};

/**
 * Export service statistics as CSV
 * @param service The service name
 * @param timeRangeHours Time range in hours to analyze (default: 24 hours)
 * @returns A URL to download the CSV file
 */
export const exportServiceStatistics = (service: string, timeRangeHours: number = 24): string => {
  return `${apiClient.defaults.baseURL}${EXPORT_ENDPOINT}/service/${service}/csv?timeRangeHours=${timeRangeHours}`;
};
