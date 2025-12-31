/**
 * Session storage utility for managing user preferences and state
 */

const STORAGE_KEYS = {
  HAS_SEEN_INSTRUCTIONS: 'hasSeenInstructions',
} as const;

/**
 * Check if user has seen the instructions dialog
 */
export function hasSeenInstructions(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.HAS_SEEN_INSTRUCTIONS) === 'true';
  } catch (error) {
    console.warn('Session storage not available:', error);
    return false;
  }
}

/**
 * Mark that user has seen the instructions dialog
 */
export function markInstructionsAsSeen(): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.HAS_SEEN_INSTRUCTIONS, 'true');
  } catch (error) {
    console.warn('Failed to save to session storage:', error);
  }
}

/**
 * Reset instructions flag (useful for testing)
 */
export function resetInstructions(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.HAS_SEEN_INSTRUCTIONS);
  } catch (error) {
    console.warn('Failed to clear session storage:', error);
  }
}
