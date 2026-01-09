import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { api } from '../../services/api';

const CategoryEditModal = ({ show, handleClose, category, onUpdate, availableMovies }) => {
  const [categoryData, setCategoryData] = useState({
    name: '',
    promoted: false,
    movies: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Listen for theme changes
  useEffect(() => {
    const updateTheme = () => {
      const theme = localStorage.getItem('theme');
      setIsDarkMode(theme !== 'light');
    };

    // Initial theme check
    updateTheme();

    // Listen for storage changes (when theme is changed in ManagementPage)
    window.addEventListener('storage', updateTheme);
    
    // Also listen for manual theme updates
    const themeInterval = setInterval(updateTheme, 100);

    return () => {
      window.removeEventListener('storage', updateTheme);
      clearInterval(themeInterval);
    };
  }, []);

  useEffect(() => {
    if (category) {
      setCategoryData({
        name: category.name || '',
        promoted: category.promoted || false,
        movies: category.movies ? category.movies.map(movie => movie._id || movie.movieId) : []
      });
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) return;

    setLoading(true);
    setError('');

    try {
      const updateData = {
        name: categoryData.name,
        promoted: categoryData.promoted
      };

      await api.updateCategory(category._id, updateData);
      onUpdate();
      handleClose();
      setError('');
    } catch (error) {
      console.error('Error updating category:', error);
      setError(error.response?.data?.error || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setError('');
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleCloseModal} className="category-edit-modal">
      <Modal.Header 
        closeButton 
        className={isDarkMode ? "bg-dark text-white" : "bg-light text-dark"}
      >
        <Modal.Title>
          <i className="fas fa-edit me-2"></i>
          Edit Category: {category?.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={isDarkMode ? "bg-dark text-white" : "bg-light text-dark"}>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Category Name *</Form.Label>
            <Form.Control
              type="text"
              value={categoryData.name}
              onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
              required
              placeholder="Enter category name"
              className="modal-form-control"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="promoted-checkbox"
              label="Promoted Category"
              checked={categoryData.promoted}
              onChange={(e) => setCategoryData({ ...categoryData, promoted: e.target.checked })}
            />
            <Form.Text className="text-muted">
              Promoted categories appear on the main page
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Current Movies in Category</Form.Label>
            <div className={`category-movies-display p-3 rounded ${isDarkMode ? 'bg-secondary' : 'bg-light'}`}>
              {category?.movies && category.movies.length > 0 ? (
                <div className="row g-2">
                  {category.movies.map((movie, index) => (
                    <div key={movie._id || index} className="col-md-6">
                      <div className="movie-tag bg-primary text-white px-2 py-1 rounded small">
                        <i className="fas fa-film me-1"></i>
                        {movie.name || 'Unknown Movie'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted text-center">
                  <i className="fas fa-info-circle me-2"></i>
                  No movies assigned to this category
                </div>
              )}
            </div>
            <Form.Text className="text-muted">
              Note: Movie assignments are managed through movie editing
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className={isDarkMode ? "bg-dark" : "bg-light"}>
        <Button variant="secondary" onClick={handleCloseModal}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Updating...
            </>
          ) : (
            <>
              <i className="fas fa-save me-2"></i>
              Update Category
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CategoryEditModal;