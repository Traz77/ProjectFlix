//A component that lets the admin edit existing movies and categories.
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner, Button } from 'react-bootstrap';
import { api } from '../../services/api';
import MovieAdminCard from './MovieAdminCard';
import MovieEditModal from './MovieEditModal';
import CategoryEditModal from './CategoryEditModal';
import './ExistingContentManagement.css';

const ExistingContentManagement = () => {
  // State to store available categories
  const [availableCategories, setAvailableCategories] = useState([]);
  // State to store movies
  const [movies, setMovies] = useState([]);
  // State to store categories
  const [categories, setCategories] = useState([]);
  // State to store error messages
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') !== 'light');

  // Modal states
  const [showMovieEditModal, setShowMovieEditModal] = useState(false);
  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchMovies();
    fetchCategories();
  }, []);

  // Fetch movies from the server
  const fetchMovies = async () => {
    try {
      setLoading(true);
      // Get all movies from the server
      const response = await api.getMovies();
      // Get unique movies from all categories
      const uniqueMovies = Array.from(
        new Map(
          response.data
            .flatMap(category => category.movies)
            .map(movie => [movie._id, movie])
        ).values()
      );
      setMovies(uniqueMovies);
    } catch (error) {
      setMessage('Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from the server
  const fetchCategories = async () => {
    try {
      // Get all categories from the server
      const response = await api.getCategories();
      // Set the categories state
      setCategories(response.data);
      setAvailableCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // // Theme toggle function
  // const toggleTheme = () => {
  //   const newMode = !isDarkMode;
  //   setIsDarkMode(newMode);
  //   localStorage.setItem('theme', newMode ? 'dark' : 'light');
  //   document.body.classList.toggle('light-mode', !newMode);
  // };

  // // Initialize theme on component mount
  // useEffect(() => {
  //   const theme = localStorage.getItem('theme');
  //   const isLight = theme === 'light';
  //   setIsDarkMode(!isLight);
  //   document.body.classList.toggle('light-mode', isLight);
  // }, []);

  const handleDeleteMovie = async (movieId) => {
    const movie = movies.find(m => m._id === movieId);
    
    // Single confirmation dialog
    if (!window.confirm(`Are you sure you want to delete "${movie?.name}"? This action cannot be undone.`)) {
      return; // User cancelled, exit early
    }

    try {
      await api.deleteMovie(movieId);
      setMessage('Movie deleted successfully!');
      fetchMovies(); // Refresh the list
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Failed to delete movie');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEditMovie = (movie) => {
    setSelectedMovie(movie);
    setShowMovieEditModal(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    
    // Single confirmation dialog
    if (!window.confirm(`Are you sure you want to delete "${category?.name}"? This action cannot be undone.`)) {
      return; // User cancelled, exit early
    }

    try {
      await api.deleteCategory(categoryId);
      setMessage('Category deleted successfully!');
      fetchCategories(); // Refresh the list
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Failed to delete category');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowCategoryEditModal(true);
  };

  const handleMovieUpdate = () => {
    fetchMovies();
    fetchCategories();
    setMessage('Movie updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCategoryUpdate = () => {
    fetchCategories();
    setMessage('Category updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p className="loading-text">Loading content...</p>
      </div>
    );
  }

  return (
    <Container fluid className="existing-content-management">
      <div className="content-header mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="section-title">
            <i className="fas fa-edit"></i>
            Manage Existing Content
          </h3>
          <p className="section-subtitle">Edit or delete existing movies and categories from your collection</p>
        </div>
      </div>

      {message && (
        <Alert variant={message.includes('success') ? 'success' : 'danger'} className="content-alert mb-4">
          {message}
        </Alert>
      )}

      {/* Movies Section */}
      <div className="content-section">
        <h4 className="section-title">
          <i className="fas fa-film"></i>
          Movies ({movies.length})
        </h4>
        {movies.length === 0 ? (
          <Alert variant="info" className="content-alert">
            <div className="empty-state">
              <i className="fas fa-info-circle"></i>
              <p>No movies found. Add some movies first!</p>
            </div>
          </Alert>
        ) : (
          <Row className="movies-grid g-3">
            {movies.map((movie) => (
              <Col key={movie._id} xs={6} sm={4} md={3} lg={2}>
                <div className="movie-admin-card-wrapper">
                  <MovieAdminCard
                    movie={movie}
                    onDelete={handleDeleteMovie}
                    onEdit={handleEditMovie}
                  />
                </div>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Categories Section */}
      <div className="content-section">
        <h4 className="section-title">
          <i className="fas fa-folder"></i>
          Categories ({categories.length})
        </h4>
        {categories.length === 0 ? (
          <Alert variant="info" className="content-alert">
            <div className="empty-state">
              <i className="fas fa-info-circle"></i>
              <p>No categories found. Add some categories first!</p>
            </div>
          </Alert>
        ) : (
          <div className="categories-list">
            {categories.map((category) => (
              <div key={category._id} className="category-item">
                <div className="category-card">
                  <div className="category-info">
                    <h5 className="category-name">{category.name}</h5>
                    <div className="category-meta">
                      <span className="category-promoted">
                        {category.promoted ? (
                          <>
                            <i className="fas fa-star text-warning"></i>
                            Promoted
                          </>
                        ) : (
                          <>
                            <i className="far fa-star text-muted"></i>
                            Regular
                          </>
                        )}
                      </span>
                      <span className="category-movies-count">
                        <i className="fas fa-film"></i>
                        {category.movies?.length || 0} movies
                      </span>
                    </div>
                  </div>
                  <div className="category-actions">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleEditCategory(category)}
                    >
                      <i className="fas fa-edit me-1"></i>
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteCategory(category._id)}
                    >
                      <i className="fas fa-trash me-1"></i>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Movie Edit Modal */}
      <MovieEditModal
        show={showMovieEditModal}
        handleClose={() => setShowMovieEditModal(false)}
        movie={selectedMovie}
        onUpdate={handleMovieUpdate}
        availableCategories={availableCategories}
      />

      {/* Category Edit Modal */}
      <CategoryEditModal
        show={showCategoryEditModal}
        handleClose={() => setShowCategoryEditModal(false)}
        category={selectedCategory}
        onUpdate={handleCategoryUpdate}
        availableMovies={movies}
      />
    </Container>
  );
};

export default ExistingContentManagement;