/**
 * Validate idea input
 * @param {string} idea - User's idea input
 * @returns {Object} Validation result
 */
function validateIdea(idea) {
  const errors = [];

  // Check if idea exists
  if (!idea) {
    errors.push('Idea is required');
  }

  // Check if idea is a string
  if (typeof idea !== 'string') {
    errors.push('Idea must be a string');
  }

  // Check minimum length
  if (idea && idea.trim().length < 20) {
    errors.push('Idea must be at least 20 characters long');
  }

  // Check if idea is not just whitespace
  if (idea && idea.trim().length === 0) {
    errors.push('Idea cannot be empty or only whitespace');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate UUID format
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid UUID
 */
function isValidUUID(id) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validate artifact type
 * @param {string} type - Artifact type
 * @returns {boolean} True if valid type
 */
function isValidArtifactType(type) {
  const validTypes = [
    'prd',
    'architecture',
    'schema',
    'api',
    'frontend',
    'tests',
    'deployment',
    'bobPrompt'
  ];
  return validTypes.includes(type);
}

module.exports = {
  validateIdea,
  isValidUUID,
  isValidArtifactType
};

// Made with Bob
