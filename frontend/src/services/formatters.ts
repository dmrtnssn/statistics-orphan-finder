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

/**
 * Format ISO timestamp to relative time
 * Returns ultra-short format: 45s, 5m, 3h, 5d, 2mo, 1y
 */
export function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return '-';

  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    // Under 1 minute: show seconds
    if (diffSeconds < 60) {
      return `${diffSeconds}s`;
    }

    // Under 1 hour: show minutes
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    }

    // Under 1 day: show hours
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}h`;
    }

    // Under 30 days: show days
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) {
      return `${diffDays}d`;
    }

    // Under 1 year: show months
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return `${diffMonths}mo`;
    }

    // 1 year or more: show years
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears}y`;
  } catch {
    return '-';
  }
}

/**
 * Format ISO timestamp to full date+time without milliseconds
 * Returns format: YYYY-MM-DD HH:MM:SS
 */
export function formatFullTimestamp(isoString: string | null): string {
  if (!isoString) return 'Never updated';

  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return isoString;
  }
}
