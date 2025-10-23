/**
 * Timing and Performance Utilities
 * Functions for controlling execution timing (debounce, throttle, delays, etc.)
 */

/**
 * Debounce function calls
 * Delays execution until after wait milliseconds have elapsed since last call
 *
 * @param func - Function to debounce
 * @param wait - Milliseconds to wait before executing
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function(this: any, ...args: Parameters<T>) {
    const context = this;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(context, args);
      timeout = null;
    }, wait);
  };
}
