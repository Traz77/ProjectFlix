// Class to make API requests to the backend server
import axios from 'axios';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3000') + '/api';

// Add a request interceptor to include the JWT token in the Authorization header
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Export the API object with methods to make requests to the backend
export const api = {
  // Authentication
  signIn: (email, password) => axios.post(`${API_URL}/tokens`, { email, password }),
  
  // Get The Movies List including the user's watch history
  getMovies: () => axios.get(`${API_URL}/movies`),
  // Get a single movie by ID
  getMovie: (id) => axios.get(`${API_URL}/movies/${id}`),
  // Create a new movie
  createMovie: (formData) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/movies`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      transformRequest: [(data) => {
        // Don't transform FormData
        return data;
      }],
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('Upload Progress:', percentCompleted, '%');
      }
    });
  },
  // Update a movie by ID
  updateMovie: (id, formData) => {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/movies/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
  },
  // Delete a movie by ID
  deleteMovie: (id) => axios.delete(`${API_URL}/movies/${id}`),
  
  // Categories
  getCategories: () => axios.get(`${API_URL}/categories`),
  createCategory: (categoryData) => axios.post(`${API_URL}/categories`, categoryData),
  updateCategory: (id, categoryData) => axios.patch(`${API_URL}/categories/${id}`, categoryData),
  deleteCategory: (id) => axios.delete(`${API_URL}/categories/${id}`),
  
  // Recommendations
  getRecommendations: (movieId) => axios.get(`${API_URL}/movies/${movieId}/recommend`),
  postRecommendation: (movieId) => axios.post(`${API_URL}/movies/${movieId}/recommend`),

  // Movies
  searchMovies: (query) => axios.get(`${API_URL}/movies/search/${query}`),
 
  // Users
  createUser: (userData) => axios.post(`${API_URL}/users`, userData),
  getWatchHistory: () => axios.get(`${API_URL}/users/history`),
  getCurrentUser: () => axios.get(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
};