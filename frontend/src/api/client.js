import axios from 'axios';

// Create axios instance with configurable base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions with error handling
export const generateBlueprint = async (idea) => {
  try {
    const response = await api.post('/api/blueprints/generate', { idea });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to generate blueprint');
  }
};

export const getBlueprints = async () => {
  try {
    const response = await api.get('/api/blueprints');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch blueprints');
  }
};

export const getBlueprintById = async (id) => {
  try {
    const response = await api.get(`/api/blueprints/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch blueprint');
  }
};

export const exportBlueprint = async (id) => {
  try {
    const response = await api.get(`/api/blueprints/${id}/export`, {
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
    
    return { success: true };
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to export blueprint');
  }
};

export const getArtifacts = async () => {
  try {
    const response = await api.get('/api/artifacts');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch artifacts');
  }
};

export const createArtifact = async (artifact) => {
  try {
    const response = await api.post('/api/artifacts', artifact);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create artifact');
  }
};

export const deleteArtifact = async (id) => {
  try {
    const response = await api.delete(`/api/artifacts/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete artifact');
  }
};

export default api;

// Made with Bob
