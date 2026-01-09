//A component that displays the movie addition form for admin users.
import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { api } from '../../services/api';

const MovieManagement = () => {
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

  const [availableCategories, setAvailableCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories from the server
  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      setAvailableCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      //create a new form data object
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

      // Convert categories to proper format
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
      if (files.images.length > 0) {
        files.images.forEach(image => {
          formData.append('images', image);
        });
      }
      if (files.movieFile) {
        formData.append('movieFile', files.movieFile);
      }

      // Send the request to the server
      const response = await api.createMovie(formData);

      // If the response is successful, reset form
      if (response.status === 201) {
        resetForm();
        setError(null);
      } else {
        throw new Error('Failed to create movie');
      }
    } catch (err) {
      console.error('Error creating movie:', err);
      setError(err.response?.data?.error || 'Failed to create movie');
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

  return (
    <div className="movie-management">
      <h2>Add New Movie</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <Form onSubmit={handleSubmit}>
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
          <Form.Control
            as="select"
            multiple
            value={movieData.categories}
            onChange={(e) => setMovieData({
              ...movieData,
              categories: Array.from(e.target.selectedOptions, option => option.value)
            })}
          >
            {availableCategories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

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

        <Button variant="primary" type="submit">
          Add Movie
        </Button>
      </Form>
    </div>
  );
};

export default MovieManagement;