// This component is used to add categories.
import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { api } from '../../services/api';

const CategoryManagement = () => {
    // State to store category data
    const [categoryData, setCategoryData] = useState({
        name: '',
        promoted: false,
        movies: []
    });
    
    // State to store available movies
    const [availableMovies, setAvailableMovies] = useState([]);

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const response = await api.getMovies();
            // Get unique movies from all categories
            const uniqueMovies = Array.from(
                // Create a new Map from the movies array in order to remove duplicates
                new Map(
                    response.data
                        // Flatten the movies array from each category
                        .flatMap(category => category.movies)
                        // Remove null values
                        .filter(movie => movie)
                        // Map each movie to an array with the movie ID as the key and the movie object as the value
                        .map(movie => [movie._id, movie])
                ).values()
            );
            // Set the available movies state
            setAvailableMovies(uniqueMovies);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Create a new category
            await api.createCategory(categoryData);
            // Reset the form
            resetForm();
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    // Reset the form
    const resetForm = () => {
        setCategoryData({
            name: '',
            promoted: false,
            movies: []
        });
    };

    // Render the component
    return (
        <div className="category-management">
            <h2>Add New Category</h2>
            <Form onSubmit={handleSubmit}>
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

                <Form.Group className="mb-3">
                    <Form.Label>Movies</Form.Label>
                    <Form.Select
                        multiple
                        value={categoryData.movies.map(m => m.movieId)}
                        onChange={(e) => {
                            const selectedMovies = Array.from(e.target.selectedOptions, option => ({
                                movieId: option.value,
                                movieName: option.text
                            }));
                            setCategoryData({ ...categoryData, movies: selectedMovies });
                        }}
                        style={{ height: '200px', background: '#333', color: 'white' }}
                    >
                        {availableMovies.map(movie => (
                            <option
                                key={movie._id}
                                value={movie._id}
                                style={{ padding: '8px', marginBottom: '4px' }}
                            >
                                {movie.name}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                        Hold Ctrl/Cmd to select multiple movies
                    </Form.Text>
                </Form.Group>

                <Button variant="primary" type="submit">Add Category</Button>
            </Form>
        </div>
    );
};

export default CategoryManagement;