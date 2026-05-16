/**
 * Input validation utilities
 * Provides comprehensive validation and sanitization for all user inputs
 */

const { VALIDATION } = require('../config/constants');

/**
 * Sanitize string input by trimming, removing null bytes, and dangerous characters
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  
  // Remove null bytes, control characters, and trim
  return input
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Validate and sanitize object recursively
 * @param {*} obj - Object to sanitize
 * @param {number} maxDepth - Maximum recursion depth
 * @returns {*} Sanitized object
 */
function sanitizeObject(obj, maxDepth = 10) {
  if (maxDepth <= 0) return null;
  
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, maxDepth - 1));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeString(key);
      if (sanitizedKey) {
        sanitized[sanitizedKey] = sanitizeObject(value, maxDepth - 1);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Check if value is a valid non-empty string
 * @param {*} value - Value to check
 * @returns {boolean} True if valid string
 */
function isValidString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if value is a valid array with minimum length
 * @param {*} value - Value to check
 * @param {number} minLength - Minimum required length
 * @returns {boolean} True if valid array
 */
function isValidArray(value, minLength = 1) {
  return Array.isArray(value) && value.length >= minLength;
}

/**
 * Validate string length
 * @param {string} value - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @param {string} fieldName - Name of field for error message
 * @returns {Object} Validation result
 */
function validateStringLength(value, min, max, fieldName) {
  const sanitized = sanitizeString(value);
  
  if (!sanitized) {
    return { 
      isValid: false, 
      errors: [`${fieldName} is required`] 
    };
  }
  
  if (sanitized.length < min) {
    return { 
      isValid: false, 
      errors: [`${fieldName} must be at least ${min} characters long`] 
    };
  }
  
  if (sanitized.length > max) {
    return { 
      isValid: false, 
      errors: [`${fieldName} must not exceed ${max} characters`] 
    };
  }
  
  return { isValid: true, value: sanitized };
}

/**
 * Validate idea input
 * @param {string} idea - The idea text to validate
 * @returns {Object} Validation result with isValid and errors properties
 */
function validateIdea(idea) {
  if (!idea || typeof idea !== 'string') {
    return { 
      isValid: false, 
      errors: ['Idea must be a non-empty string'] 
    };
  }

  return validateStringLength(
    idea,
    VALIDATION.MIN_IDEA_LENGTH,
    VALIDATION.MAX_IDEA_LENGTH,
    'Idea'
  );
}

/**
 * Validate blueprint data
 * @param {Object} blueprint - The blueprint object to validate
 * @returns {Object} Validation result
 */
function validateBlueprint(blueprint) {
  const errors = [];

  if (!blueprint || typeof blueprint !== 'object') {
    return { isValid: false, errors: ['Blueprint must be an object'] };
  }

  // Validate title
  const titleValidation = validateStringLength(
    blueprint.title,
    VALIDATION.MIN_TITLE_LENGTH,
    VALIDATION.MAX_TITLE_LENGTH,
    'Title'
  );
  if (!titleValidation.isValid) {
    errors.push(...titleValidation.errors);
  }

  // Validate description
  const descValidation = validateStringLength(
    blueprint.description,
    VALIDATION.MIN_DESCRIPTION_LENGTH,
    VALIDATION.MAX_DESCRIPTION_LENGTH,
    'Description'
  );
  if (!descValidation.isValid) {
    errors.push(...descValidation.errors);
  }

  return errors.length > 0 
    ? { isValid: false, errors } 
    : { isValid: true };
}

/**
 * Validate artifact data
 * @param {Object} artifact - The artifact object to validate
 * @returns {Object} Validation result
 */
function validateArtifact(artifact) {
  const errors = [];

  if (!artifact || typeof artifact !== 'object') {
    return { isValid: false, errors: ['Artifact must be an object'] };
  }

  // Required fields
  const requiredFields = ['projectName', 'filePath', 'artifactType', 'purpose'];
  
  for (const field of requiredFields) {
    if (!artifact[field] || typeof artifact[field] !== 'string' || !artifact[field].trim()) {
      errors.push(`${field} is required and must be a non-empty string`);
    }
  }

  return errors.length > 0 
    ? { isValid: false, errors } 
    : { isValid: true };
}

module.exports = {
  sanitizeString,
  sanitizeObject,
  isValidString,
  isValidArray,
  validateStringLength,
  validateIdea,
  validateBlueprint,
  validateArtifact,
};

// Made with Bob
