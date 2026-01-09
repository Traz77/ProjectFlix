import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { api } from '../../services/api';

const MovieEditModal = ({ show, handleClose, movie, onUpdate, availableCategories }) => {
  const [movieData, setMovieData] = useState({
    name: '',
    duration: '',
    year: '',
    description: '',
    director: '',
    cast: '',
    categories: []
  });
  const [files, setFiles] = useState({
    mainImage: null,
    trailer: null,
    movieFile: null,
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (movie) {
      setMovieData({
        name: movie.name || '',
        duration: movie.duration || '',
        year: movie.year || '',
        description: movie.description || '',
        director: movie.director || '',
        cast: movie.cast ? movie.cast.join(', ') : '',
        categories: movie.categories ? movie.categories.map(cat => cat._id || cat.categoryId) : []
      });
    }
  }, [movie]);

  useEffect(() => {
    const updateTheme = () => {
      const theme = localStorage.getItem('theme');
      setIsDarkMode(theme !== 'light');
    };

    // Initial theme check
    updateTheme();

    // Listen for storage changes and manual updates
    window.addEventListener('storage', updateTheme);
    const themeInterval = setInterval(updateTheme, 100);

    return () => {
      window.removeEventListener('storage', updateTheme);
      clearInterval(themeInterval);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!movie) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();

      // Basic fields
      formData.append('name', movieData.name);
      formData.append('duration', movieData.duration);
      formData.append('year', movieData.year);
      formData.append('description', movieData.description || '');
      formData.append('director', movieData.director || '');

      // Convert cast to array and stringify
      const castArr = movieData.cast.split(',').map(actor => actor.trim());
      formData.append('cast', JSON.stringify(castArr));

      // Categories
      const categoriesArr = movieData.categories.map(cat => ({
        categoryId: cat,
        categoryName: availableCategories.find(c => c._id === cat)?.name || ''
      }));
      formData.append('categories', JSON.stringify(categoriesArr));

      // Handle files
      if (files.mainImage) {
        formData.append('mainImage', files.mainImage);
      }
      if (files.trailer) {
        formData.append('trailer', files.trailer);
      }
      if (files.movieFile) {
        formData.append('movieFile', files.movieFile);
      }
      if (files.images.length > 0) {
        files.images.forEach(image => {
          formData.append('images', image);
        });
      }

      await api.updateMovie(movie._id, formData);
      onUpdate();
      handleClose();
      resetForm();
    } catch (error) {
      console.error('Error updating movie:', error);
      setError(error.response?.data?.error || 'Failed to update movie');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFiles({
      mainImage: null,
      trailer: null,
      movieFile: null,
      images: []
    });
    setError('');
  };

  const handleCloseModal = () => {
    resetForm();
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleCloseModal} size="lg" className="movie-edit-modal">
      <Modal.Header className={isDarkMode ? "bg-dark text-white" : "bg-light text-dark"} closeButton>
        <Modal.Title>
          <i className="fas fa-edit me-2"></i>
          Edit Movie: {movie?.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={isDarkMode ? "bg-dark text-white" : "bg-light text-dark"}>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={movieData.name}
                  onChange={(e) => setMovieData({ ...movieData, name: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Duration (minutes) *</Form.Label>
                <Form.Control
                  type="number"
                  value={movieData.duration}
                  onChange={(e) => setMovieData({ ...movieData, duration: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Year *</Form.Label>
                <Form.Control
                  type="number"
                  value={movieData.year}
                  onChange={(e) => setMovieData({ ...movieData, year: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={movieData.description}
              onChange={(e) => setMovieData({ ...movieData, description: e.target.value })}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Director</Form.Label>
                <Form.Control
                  type="text"
                  value={movieData.director}
                  onChange={(e) => setMovieData({ ...movieData, director: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cast (comma-separated)</Form.Label>
                <Form.Control
                  type="text"
                  value={movieData.cast}
                  onChange={(e) => setMovieData({ ...movieData, cast: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Categories</Form.Label>
            <Form.Control
              as="select"
              multiple
              value={movieData.categories}
              onChange={(e) => setMovieData({
                ...movieData,
                categories: Array.from(e.target.selectedOptions, option => option.value)
              })}
              style={{ height: '120px' }}
            >
              {availableCategories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </Form.Control>
            <Form.Text className="text-muted">
              Hold Ctrl/Cmd to select multiple categories
            </Form.Text>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Main Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFiles({ ...files, mainImage: e.target.files[0] })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Trailer</Form.Label>
                <Form.Control
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFiles({ ...files, trailer: e.target.files[0] })}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Movie File</Form.Label>
            <Form.Control
              type="file"
              accept="video/*"
              onChange={(e) => setFiles({ ...files, movieFile: e.target.files[0] })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Additional Images</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles({ ...files, images: Array.from(e.target.files) })}
            />
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
              Update Movie
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MovieEditModal;