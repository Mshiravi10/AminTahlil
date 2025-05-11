/**
 * Format a duration in milliseconds to a human-readable string
 * @param durationMs Duration in milliseconds
 * @returns Formatted duration string
 */
export const formatDuration = (durationMs: number): string => {
  if (durationMs < 1) {
    return `${(durationMs * 1000).toFixed(2)} µs`;
  }
  if (durationMs < 1000) {
    return `${durationMs.toFixed(2)} ms`;
  }
  if (durationMs < 60000) {
    return `${(durationMs / 1000).toFixed(2)} s`;
  }
  const minutes = Math.floor(durationMs / 60000);
  const seconds = ((durationMs % 60000) / 1000).toFixed(1);
  return `${minutes}:${seconds.padStart(4, '0')} دقیقه`;
};

/**
 * Format a date string to a localized date and time
 * @param dateString ISO date string
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

/**
 * Format a date string to a localized time only
 * @param dateString ISO date string
 * @returns Formatted time string
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

/**
 * Format a number as a percentage
 * @param value Number to format as percentage
 * @param digits Number of digits after decimal point
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, digits: number = 1): string => {
  return `${(value * 100).toFixed(digits)}%`;
};

/**
 * Truncate a string to a specified length and add ellipsis if needed
 * @param str String to truncate
 * @param length Maximum length
 * @returns Truncated string
 */
export const truncateString = (str: string, length: number = 30): string => {
  if (!str) return '';
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
};
