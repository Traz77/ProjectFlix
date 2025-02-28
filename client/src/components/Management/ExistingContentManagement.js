//A component that lets the admin edit existing movies and categories.
import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup, Row, Col } from 'react-bootstrap';
import { api } from '../../services/api';

const ExistingContentManagement = () => {
  // State to store available categories
  const [availableCategories, setAvailableCategories] = useState([]);
  // State to store the selected movie
  const [selectedMovie, setSelectedMovie] = useState(null);
  // State to store the selected category
  const [selectedCategory, setSelectedCategory] = useState(null);
  // State to store movies
  const [movies, setMovies] = useState([]);
  // State to store categories
  const [categories, setCategories] = useState([]);
  // State to store error messages
  const [error, setError] = useState(null);
  // State to store the selected files
  const [files, setFiles] = useState({
    mainImage: null,
    trailer: null,
    movieFile: null,
    images: []
  });
  // State to store movie data
  const [movieData, setMovieData] = useState({
    name: '',
    duration: '',
    year: '',
    description: '',
    director: '',
    cast: '',
    categories: []
  });
  // State to store category data
  const [categoryData, setCategoryData] = useState({
    name: '',
    promoted: false,
    movies: []
  });

  useEffect(() => {
    fetchMovies();
    fetchCategories();
  }, []);

  // Fetch movies from the server
  const fetchMovies = async () => {
    try {
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
      console.error('Error fetching movies:', error);
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

  // Function to validate movie data before updating
  const validateMovieData = (data) => {
    const errors = [];

    // Required fields validation
    // Check if the name is empty or only contains whitespace
    if (!data.name?.trim()) errors.push('Movie name is required');
    // Check if the duration is empty
    if (!data.duration) errors.push('Duration is required');
    // Check if the year is empty
    if (!data.year) errors.push('Year is required');

    // Numeric fields validation
    if (isNaN(data.duration) || data.duration <= 0) errors.push('Duration must be a positive number');
    if (isNaN(data.year) || data.year < 0) errors.push('Year must be valid positive number');

    // Cast validation (if provided)
    if (data.cast && typeof data.cast === 'string') {
      // Split the cast string , convert to array and check if any entry is empty
      const castArr = data.cast.split(',');
      if (castArr.some(actor => !actor.trim())) {
        errors.push('Cast entries cannot be empty');
      }
    }
    return errors;
  };

  const handleMovieUpdate = async (e) => {
    // Prevent the default form submission
    e.preventDefault();
    if (!selectedMovie) return;

    try {
      //check if the movie data is valid
      const validationErrors = validateMovieData(movieData);
      if (validationErrors.length > 0) {
        setError(validationErrors.join('\n'));
        return;
      }

      // Create a new FormData object 
      const formData = new FormData();

      // Basic fields (required)
      formData.append('name', movieData.name);
      formData.append('duration', movieData.duration);
      formData.append('year', movieData.year);

      // Optional fields
      formData.append('description', movieData.description || '');
      formData.append('director', movieData.director || '');

      // Convert cast to array and stringify
      const castArr = movieData.cast.split(',').map(actor => actor.trim());
      formData.append('cast', JSON.stringify(castArr));

      // Categories
      formData.append('categories', JSON.stringify(movieData.categories));

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

      // Send the update request to the server
      await api.updateMovie(selectedMovie._id, formData);
      // Fetch movies again to update the list
      fetchMovies();
      // Reset the form and selected movie
      setSelectedMovie(null);
      resetForm();
      setError(null);
    } catch (error) {
      console.error('Error updating movie:', error);
      setError(error.response?.data?.error || 'Failed to update movie');
    }
  };

  const resetForm = () => {
    setMovieData({
      name: '',
      duration: '',
      year: '',
      description: '',
      director: '',
      cast: '',
      categories: []
    });
    setFiles({
      mainImage: null,
      trailer: null,
      movieFile: null,
      images: []
    });
  };
  
  const handleCategoryUpdate = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;

    try {
      await api.updateCategory(selectedCategory._id, categoryData);
      fetchCategories();
      setSelectedCategory(null);
      setCategoryData({
        name: '',
        promoted: false,
        movies: []
      });
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  return (
    <div className="existing-content-management">
      <Row>
        <Col md={6}>
          <h3>Edit Existing Movie</h3>
          {error && (
            <div className="alert alert-danger" style={{ whiteSpace: 'pre-line' }}>
              {error}
            </div>
          )}
          <ListGroup className="mb-3">
            {movies.map(movie => (
              <ListGroup.Item
                key={movie._id}
                action
                active={selectedMovie?._id === movie._id}
                onClick={() => {
                  setSelectedMovie(movie);
                  setMovieData({
                    name: movie.name,
                    duration: movie.duration,
                    year: movie.year,
                    description: movie.description || '',
                    director: movie.director || '',
                    cast: movie.cast?.join(', ') || '',
                    categories: movie.categories || []
                  });
                }}
              >
                {movie.name} (ID: {movie._id})
              </ListGroup.Item>
            ))}
          </ListGroup>

          {selectedMovie && (
            <Form onSubmit={handleMovieUpdate}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={movieData.name}
                  onChange={(e) => setMovieData({ ...movieData, name: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Duration (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  value={movieData.duration}
                  onChange={(e) => setMovieData({ ...movieData, duration: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Year</Form.Label>
                <Form.Control
                  type="number"
                  value={movieData.year}
                  onChange={(e) => setMovieData({ ...movieData, year: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={movieData.description}
                  onChange={(e) => setMovieData({ ...movieData, description: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Director</Form.Label>
                <Form.Control
                  type="text"
                  value={movieData.director}
                  onChange={(e) => setMovieData({ ...movieData, director: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Cast (comma-separated)</Form.Label>
                <Form.Control
                  type="text"
                  value={movieData.cast}
                  onChange={(e) => setMovieData({ ...movieData, cast: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Categories</Form.Label>
                <Form.Select
                  multiple
                  value={movieData.categories.map(c => c.categoryId)}
                  onChange={(e) => {
                    const selectedCategories = Array.from(e.target.selectedOptions, option => ({
                      categoryId: option.value,
                      categoryName: availableCategories.find(c => c._id === option.value)?.name || ''
                    }));
                    setMovieData({ ...movieData, categories: selectedCategories });
                  }}
                >
                  {availableCategories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* File upload fields */}
              <Form.Group className="mb-3">
                <Form.Label>Main Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFiles({
                    ...files,
                    mainImage: e.target.files[0]
                  })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Trailer</Form.Label>
                <Form.Control
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFiles({
                    ...files,
                    trailer: e.target.files[0]
                  })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Movie File</Form.Label>
                <Form.Control
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFiles({
                    ...files,
                    movieFile: e.target.files[0]
                  })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Additional Images</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFiles({
                    ...files,
                    images: Array.from(e.target.files)
                  })}
                />
              </Form.Group>

              <Button variant="primary" type="submit">Update Movie</Button>
            </Form>
          )}
        </Col>

        <Col md={6}>
          <h3>Edit Existing Category</h3>
          <ListGroup className="mb-3">
            {categories.map(category => (
              <ListGroup.Item
                key={category._id}
                action
                active={selectedCategory?._id === category._id}
                onClick={() => {
                  setSelectedCategory(category);
                  setCategoryData({
                    name: category.name,
                    promoted: category.promoted,
                    movies: category.movies || []
                  });
                }}
              >
                {category.name}
              </ListGroup.Item>
            ))}
          </ListGroup>

          {selectedCategory && (
            <Form onSubmit={handleCategoryUpdate}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={categoryData.name}
                  onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Promoted"
                  checked={categoryData.promoted}
                  onChange={(e) => setCategoryData({ ...categoryData, promoted: e.target.checked })}
                />
              </Form.Group>

              <Button type="submit" variant="primary">Update Category</Button>
            </Form>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ExistingContentManagement;