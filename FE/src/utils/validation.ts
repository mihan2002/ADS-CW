export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate name input
 * Requirements: 2-50 characters
 */
export function validateName(name: string): ValidationError | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { field: "name", message: "Name must be at least 2 characters long" };
  }
  if (trimmed.length > 50) {
    return { field: "name", message: "Name must not exceed 50 characters" };
  }
  return null;
}

/**
 * Validate email format
 * Requirements: valid email format
 */
export function validateEmail(email: string): ValidationError | null {
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    return { field: "email", message: "Please enter a valid email address" };
  }
  return null;
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one number
 */
export function validatePassword(password: string): ValidationError | null {
  if (password.length < 8) {
    return { field: "password", message: "Password must be at least 8 characters long" };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { field: "password", message: "Password must contain at least one uppercase letter" };
  }
  
  if (!/[0-9]/.test(password)) {
    return { field: "password", message: "Password must contain at least one number" };
  }
  
  return null;
}

/**
 * Validate age
 * Requirements: positive integer, reasonable range
 */
export function validateAge(age: number): ValidationError | null {
  if (!Number.isInteger(age) || age < 1) {
    return { field: "age", message: "Age must be a positive number" };
  }
  
  if (age < 16 || age > 120) {
    return { field: "age", message: "Please enter a valid age (16-120)" };
  }
  
  return null;
}

/**
 * Validate bid amount
 * Requirements:
 * - Positive number
 * - Optionally greater than current bid
 */
export function validateBidAmount(
  amount: number,
  currentBid?: number | null
): ValidationError | null {
  if (isNaN(amount) || amount <= 0) {
    return { field: "amount", message: "Bid amount must be a positive number" };
  }

  if (currentBid && amount <= currentBid) {
    return {
      field: "amount",
      message: `Bid amount must be greater than the current bid (${currentBid})`,
    };
  }

  return null;
}

/**
 * Validate registration form
 */
export function validateRegistrationForm(data: {
  name: string;
  age: number;
  email: string;
  password: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  const nameError = validateName(data.name);
  if (nameError) errors.push(nameError);

  const ageError = validateAge(data.age);
  if (ageError) errors.push(ageError);

  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.push(passwordError);

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate login form
 */
export function validateLoginForm(data: {
  email: string;
  password: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  if (!data.password || data.password.trim().length === 0) {
    errors.push({ field: "password", message: "Password is required" });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
