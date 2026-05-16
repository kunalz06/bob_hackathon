import axios from 'axios';

// Create axios instance with configurable base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract error message from various possible locations
    const errorMessage = 
      error.response?.data?.error?.message ||
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: errorMessage,
    });

    // Create enhanced error object
    const enhancedError = new Error(errorMessage);
    enhancedError.status = error.response?.status;
    enhancedError.code = error.response?.data?.error?.code || error.code;
    enhancedError.details = error.response?.data?.error?.details;

    return Promise.reject(enhancedError);
  }
);

/**
 * Generate a new blueprint from an idea
 * @param {string} idea - The project idea
 * @returns {Promise<Object>} Generated blueprint data
 */
export const generateBlueprint = async (idea) => {
  const response = await api.post('/api/blueprints/generate', { idea });
  return response.data;
};

/**
 * Get all blueprints
 * @returns {Promise<Object>} Blueprints data
 */
export const getBlueprints = async () => {
  const response = await api.get('/api/blueprints');
  return response.data;
};

/**
 * Get a blueprint by ID
 * @param {string} id - Blueprint ID
 * @returns {Promise<Object>} Blueprint data
 */
export const getBlueprintById = async (id) => {
  if (!id) {
    throw new Error('Blueprint ID is required');
  }
  const response = await api.get(`/api/blueprints/${id}`);
  return response.data;
};

/**
 * Export a blueprint as markdown
 * @param {string} id - Blueprint ID
 * @returns {Promise<Object>} Export result
 */
export const exportBlueprint = async (id) => {
  if (!id) {
    throw new Error('Blueprint ID is required');
  }

  const response = await api.get(`/api/blueprints/${id}/export/markdown`, {
    responseType: 'blob',
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  
  // Extract filename from Content-Disposition header or use default
  const contentDisposition = response.headers['content-disposition'];
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1].replace(/"/g, '')
    : `blueprint-${id}.md`;
  
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return { success: true, filename };
};

/**
 * Get all artifacts
 * @param {string} projectName - Optional project name filter
 * @returns {Promise<Object>} Artifacts data
 */
export const getArtifacts = async (projectName = null) => {
  const params = projectName ? { projectName } : {};
  const response = await api.get('/api/artifacts', { params });
  return response.data;
};

/**
 * Create a new artifact
 * @param {Object} artifact - Artifact data
 * @returns {Promise<Object>} Created artifact data
 */
export const createArtifact = async (artifact) => {
  if (!artifact || typeof artifact !== 'object') {
    throw new Error('Valid artifact object is required');
  }
  const response = await api.post('/api/artifacts', artifact);
  return response.data;
};

/**
 * Delete an artifact by ID
 * @param {string} id - Artifact ID
 * @returns {Promise<Object>} Delete result
 */
export const deleteArtifact = async (id) => {
  if (!id) {
    throw new Error('Artifact ID is required');
  }
  const response = await api.delete(`/api/artifacts/${id}`);
  return response.data;
};

/**
 * Check API health
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

export default api;

// Made with Bob
