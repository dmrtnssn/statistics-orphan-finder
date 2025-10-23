/**
 * Utility functions for formatting data
 */

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  // Format with appropriate decimals
  if (i === 0) {
    return `${value} ${sizes[i]}`;
  } else if (value >= 100) {
    return `${value.toFixed(0)} ${sizes[i]}`;
  } else if (value >= 10) {
    return `${value.toFixed(1)} ${sizes[i]}`;
  } else {
    return `${value.toFixed(2)} ${sizes[i]}`;
  }
}

/**
 * Format number with thousands separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format interval in seconds to human-readable string
 */
export function formatInterval(seconds: number | null): string {
  if (seconds === null || seconds === 0) {
    return '';
  }

  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = seconds / 60;
    return minutes >= 10 ? `${minutes.toFixed(1)}min` : `${minutes.toFixed(2)}min`;
  } else {
    const hours = seconds / 3600;
    return hours >= 10 ? `${hours.toFixed(1)}h` : `${hours.toFixed(2)}h`;
  }
}

/**
 * Format ISO date string to readable format
 */
export function formatDate(isoString: string | null): string {
  if (!isoString) return '';

  try {
    const date = new Date(isoString);
    return date.toLocaleString();
  } catch {
    return isoString;
  }
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
}
