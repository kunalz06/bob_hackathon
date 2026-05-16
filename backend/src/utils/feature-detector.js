/**
 * Feature Detection Utility
 * Centralizes feature detection logic used across multiple generators
 * Provides consistent feature identification based on keywords
 */

/**
 * Detect if authentication/user management is needed
 * @param {Object} input - Input containing features, title, description
 * @returns {boolean} True if auth features detected
 */
function hasAuthFeature(input) {
  const searchText = getSearchableText(input);
  const authKeywords = ['auth', 'login', 'sign in', 'sign up', 'user', 'account', 'register'];
  return containsAnyKeyword(searchText, authKeywords);
}

/**
 * Detect if dashboard/analytics features are needed
 * @param {Object} input - Input containing features, title, description
 * @returns {boolean} True if dashboard features detected
 */
function hasDashboardFeature(input) {
  const searchText = getSearchableText(input);
  const dashboardKeywords = ['dashboard', 'analytics', 'report', 'metrics', 'statistics'];
  return containsAnyKeyword(searchText, dashboardKeywords);
}

/**
 * Detect if API/integration features are needed
 * @param {Object} input - Input containing features, title, description
 * @returns {boolean} True if API features detected
 */
function hasAPIFeature(input) {
  const searchText = getSearchableText(input);
  const apiKeywords = ['api', 'integration', 'webhook', 'third-party', 'external'];
  return containsAnyKeyword(searchText, apiKeywords);
}

/**
 * Detect if real-time features are needed
 * @param {Object} input - Input containing features, title, description
 * @returns {boolean} True if real-time features detected
 */
function hasRealtimeFeature(input) {
  const searchText = getSearchableText(input);
  const realtimeKeywords = ['real-time', 'realtime', 'live', 'websocket', 'notification', 'chat'];
  return containsAnyKeyword(searchText, realtimeKeywords);
}

/**
 * Detect if file upload features are needed
 * @param {Object} input - Input containing features, title, description
 * @returns {boolean} True if file upload features detected
 */
function hasFileUploadFeature(input) {
  const searchText = getSearchableText(input);
  const uploadKeywords = ['upload', 'file', 'document', 'image', 'attachment', 'media'];
  return containsAnyKeyword(searchText, uploadKeywords);
}

/**
 * Detect if search features are needed
 * @param {Object} input - Input containing features, title, description
 * @returns {boolean} True if search features detected
 */
function hasSearchFeature(input) {
  const searchText = getSearchableText(input);
  const searchKeywords = ['search', 'find', 'filter', 'query', 'lookup'];
  return containsAnyKeyword(searchText, searchKeywords);
}

/**
 * Detect if payment/billing features are needed
 * @param {Object} input - Input containing features, title, description
 * @returns {boolean} True if payment features detected
 */
function hasPaymentFeature(input) {
  const searchText = getSearchableText(input);
  const paymentKeywords = ['payment', 'billing', 'subscription', 'checkout', 'stripe', 'paypal'];
  return containsAnyKeyword(searchText, paymentKeywords);
}

/**
 * Detect if email features are needed
 * @param {Object} input - Input containing features, title, description
 * @returns {boolean} True if email features detected
 */
function hasEmailFeature(input) {
  const searchText = getSearchableText(input);
  const emailKeywords = ['email', 'notification', 'alert', 'reminder', 'mail'];
  return containsAnyKeyword(searchText, emailKeywords);
}

/**
 * Detect all features at once
 * @param {Object} input - Input containing features, title, description
 * @returns {Object} Object with all feature flags
 */
function detectAllFeatures(input) {
  return {
    hasAuth: hasAuthFeature(input),
    hasDashboard: hasDashboardFeature(input),
    hasAPI: hasAPIFeature(input),
    hasRealtime: hasRealtimeFeature(input),
    hasFileUpload: hasFileUploadFeature(input),
    hasSearch: hasSearchFeature(input),
    hasPayment: hasPaymentFeature(input),
    hasEmail: hasEmailFeature(input)
  };
}

/**
 * Get searchable text from input (combines title, description, features)
 * @param {Object} input - Input object
 * @returns {string} Lowercase searchable text
 */
function getSearchableText(input) {
  const parts = [];
  
  // Add title
  if (input.title) {
    parts.push(input.title);
  }
  
  // Add description
  if (input.description) {
    parts.push(input.description);
  }
  
  // Add features
  if (Array.isArray(input.features)) {
    input.features.forEach(feature => {
      if (typeof feature === 'string') {
        parts.push(feature);
      } else if (feature && feature.name) {
        parts.push(feature.name);
      }
    });
  }
  
  // Add key features if present
  if (Array.isArray(input.keyFeatures)) {
    parts.push(...input.keyFeatures);
  }
  
  return parts.join(' ').toLowerCase();
}

/**
 * Check if text contains any of the keywords
 * @param {string} text - Text to search in
 * @param {Array<string>} keywords - Keywords to search for
 * @returns {boolean} True if any keyword found
 */
function containsAnyKeyword(text, keywords) {
  if (!text || !Array.isArray(keywords)) {
    return false;
  }
  
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Extract target users from text
 * @param {string} text - Text to analyze
 * @returns {Array<string>} List of detected user types
 */
function extractTargetUsers(text) {
  if (!text) return ['General Users'];
  
  const lowerText = text.toLowerCase();
  const users = [];
  
  const userPatterns = [
    { keywords: ['developer', 'programmer', 'coder'], type: 'Developers' },
    { keywords: ['business', 'manager', 'executive'], type: 'Business Users' },
    { keywords: ['admin', 'administrator'], type: 'Administrators' },
    { keywords: ['customer', 'client', 'buyer'], type: 'Customers' },
    { keywords: ['student', 'learner'], type: 'Students' },
    { keywords: ['teacher', 'instructor', 'educator'], type: 'Teachers' },
    { keywords: ['doctor', 'physician', 'medical'], type: 'Healthcare Professionals' },
    { keywords: ['patient'], type: 'Patients' }
  ];
  
  userPatterns.forEach(pattern => {
    if (containsAnyKeyword(lowerText, pattern.keywords)) {
      users.push(pattern.type);
    }
  });
  
  return users.length > 0 ? users : ['General Users'];
}

module.exports = {
  hasAuthFeature,
  hasDashboardFeature,
  hasAPIFeature,
  hasRealtimeFeature,
  hasFileUploadFeature,
  hasSearchFeature,
  hasPaymentFeature,
  hasEmailFeature,
  detectAllFeatures,
  extractTargetUsers,
  getSearchableText,
  containsAnyKeyword
};

// Made with Bob