// This component is used to add and delete categories.
import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
import { api } from '../../services/api';

const CategoryManagement = () => {
    // State to store category data
    const [categoryData, setCategoryData] = useState({
        name: '',
        promoted: false,
        movies: []
    });
    // State to store categories
    const [categories, setCategories] = useState([]);
    // State to store available movies
    const [availableMovies, setAvailableMovies] = useState([]);
    // State to store category ID to delete
    const [deleteId, setDeleteId] = useState('');

    useEffect(() => {
        fetchCategories();
        fetchMovies();
    }, []);

    // Fetch categories from the server
    const fetchCategories = async () => {
        try {
            // Get all categories from the server
            const response = await api.getCategories();
            // Set the categories state
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

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
            // Fetch categories again to update the list
            fetchCategories();
            // Reset the form
            resetForm();
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    // Handle category deletion
    const handleDelete = async () => {
        try {
            // Delete the category with the specified ID
            await api.deleteCategory(deleteId);
            // Fetch categories again to update the list
            fetchCategories();
            // Reset the delete ID
            setDeleteId('');
        } catch (error) {
            console.error('Error deleting category:', error);
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

            <div className="delete-section mt-4">
                <h2>Delete Category</h2>
                <div className="d-flex gap-2">
                    <Form.Control
                        type="text"
                        placeholder="Enter category ID"
                        value={deleteId}
                        onChange={(e) => setDeleteId(e.target.value)}
                    />
                    <Button variant="danger" onClick={handleDelete}>Delete</Button>
                </div>
            </div>

            <ListGroup className="mt-4">
                {categories.map(category => (
                    <ListGroup.Item key={category._id} className="d-flex justify-content-between align-items-center">
                        {category.name} (ID: {category._id})
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );
};

export default CategoryManagement;