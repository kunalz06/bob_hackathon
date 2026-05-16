/**
 * Base Generator Class
 * Provides common functionality for all generators to reduce code duplication
 * and ensure consistent validation, error handling, and context management
 */

class BaseGenerator {
  constructor(name) {
    this.name = name;
  }

  /**
   * Main generate method - template pattern
   * Subclasses should override validateContext, extractInput, and generateArtifact
   * @param {Object} context - Accumulated context from previous generators
   * @returns {Promise<Object>} Enhanced context with new artifact
   */
  async generate(context) {
    try {
      // Step 1: Validate context has required dependencies
      this.validateContext(context);
      
      // Step 2: Extract relevant input from context
      const input = this.extractInput(context);
      
      // Step 3: Generate the artifact
      const artifact = await this.generateArtifact(input, context);
      
      // Step 4: Validate generated artifact
      this.validateArtifact(artifact);
      
      // Step 5: Return enhanced context
      return this.enhanceContext(context, artifact);
    } catch (error) {
      throw new Error(`${this.name} Generator: ${error.message}`);
    }
  }

  /**
   * Validate that context contains required dependencies
   * Subclasses should override to check specific requirements
   * @param {Object} context - Context to validate
   * @throws {Error} If validation fails
   */
  validateContext(context) {
    if (!context || typeof context !== 'object') {
      throw new Error('Context must be a valid object');
    }
  }

  /**
   * Extract relevant input from context
   * Subclasses should override to extract specific fields
   * @param {Object} context - Full context
   * @returns {Object} Extracted input
   */
  extractInput(context) {
    return {
      title: context.idea?.processed?.title || 'Untitled',
      description: context.idea?.processed?.description || ''
    };
  }

  /**
   * Generate the artifact - must be implemented by subclasses
   * @param {Object} input - Extracted input
   * @param {Object} context - Full context for reference
   * @returns {Promise<Object>} Generated artifact
   */
  async generateArtifact(input, context) {
    throw new Error('generateArtifact must be implemented by subclass');
  }

  /**
   * Validate generated artifact
   * Subclasses should override to add specific validation
   * @param {Object} artifact - Generated artifact
   * @throws {Error} If validation fails
   */
  validateArtifact(artifact) {
    if (!artifact || typeof artifact !== 'object') {
      throw new Error('Generated artifact must be a valid object');
    }
  }

  /**
   * Enhance context with generated artifact
   * Subclasses can override to customize context enhancement
   * @param {Object} context - Original context
   * @param {Object} artifact - Generated artifact
   * @returns {Object} Enhanced context
   */
  enhanceContext(context, artifact) {
    return {
      ...context,
      [this.getArtifactKey()]: artifact
    };
  }

  /**
   * Get the key name for storing artifact in context
   * Subclasses should override to specify their artifact key
   * @returns {string} Artifact key name
   */
  getArtifactKey() {
    return this.name.toLowerCase();
  }

  /**
   * Check if a feature exists in the feature list
   * @param {Array} features - List of features
   * @param {string|Array} keywords - Keyword(s) to search for
   * @returns {boolean} True if feature found
   */
  hasFeature(features, keywords) {
    if (!Array.isArray(features)) return false;
    
    const keywordArray = Array.isArray(keywords) ? keywords : [keywords];
    const featuresText = features.map(f => 
      typeof f === 'string' ? f : f.name || ''
    ).join(' ').toLowerCase();
    
    return keywordArray.some(keyword => 
      featuresText.includes(keyword.toLowerCase())
    );
  }

  /**
   * Safely get nested property from object
   * @param {Object} obj - Object to traverse
   * @param {string} path - Dot-separated path (e.g., 'idea.processed.title')
   * @param {*} defaultValue - Default value if path not found
   * @returns {*} Value at path or default
   */
  getNestedProperty(obj, path, defaultValue = null) {
    return path.split('.').reduce((current, key) => 
      current?.[key] ?? defaultValue, obj
    );
  }

  /**
   * Ensure array is valid and has minimum length
   * @param {*} value - Value to check
   * @param {number} minLength - Minimum required length
   * @param {Array} defaultValue - Default value if invalid
   * @returns {Array} Valid array
   */
  ensureArray(value, minLength = 0, defaultValue = []) {
    if (!Array.isArray(value) || value.length < minLength) {
      return defaultValue;
    }
    return value;
  }
}

module.exports = BaseGenerator;

// Made with Bob