/**
 * Custom error class for 403 Forbidden errors
 */
export class ForbiddenError extends Error {
  constructor(message: string = "You do not have permission to access this resource") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Check if an error is a 403 Forbidden error
 */
export function isForbiddenError(error: any): boolean {
  if (error instanceof ForbiddenError) {
    return true;
  }
  
  // Check for axios error with 403 status
  if (error?.response?.status === 403) {
    return true;
  }
  
  return false;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  if (isForbiddenError(error)) {
    return "You do not have permission to access this resource";
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return "An unexpected error occurred";
}

/**
 * Handle API error with proper 403 handling
 */
export function handleApiError(error: any): never {
  if (isForbiddenError(error)) {
    throw new ForbiddenError();
  }
  
  throw error;
}
