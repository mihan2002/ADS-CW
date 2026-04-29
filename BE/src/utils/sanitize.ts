import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes user input to prevent XSS attacks.
 * Removes all HTML tags and scripts while preserving plain text.
 */
export function sanitizeInput(input: string | undefined | null): string | undefined {
  if (!input) return input as undefined;
  
  // Remove all HTML tags and scripts
  return sanitizeHtml(input, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  }).trim();
}

/**
 * Sanitizes an object's string properties recursively.
 * Useful for sanitizing DTOs with multiple fields.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    const value = sanitized[key];
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value) as any;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    }
  }
  
  return sanitized;
}
