import React from 'react';
import { Card, Button } from 'react-bootstrap';
import './MovieAdminCard.css';

const MovieAdminCard = ({ movie, onDelete, onEdit }) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://place-hold.it/245x140';

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    return `${serverUrl}${imagePath}`;
  };

  const handleDeleteClick = () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${movie.name}"?`);
    if (confirmDelete) {
      onDelete(movie._id);
    }
  };

  return (
    <Card className="movie-admin-card h-100">
      <div className="movie-admin-image-container">
        <img 
          src={getImageUrl(movie.mainImage)} 
          alt={movie.name} 
          className="movie-admin-img"
        />
      </div>
      <Card.Body className="d-flex flex-column p-2">
        <Card.Title className="movie-admin-title text-truncate">{movie.name}</Card.Title>
        <Card.Text className="movie-admin-info mb-2">
          <small className="text-muted">
            {movie.year} • {movie.duration}m
          </small>
        </Card.Text>
        <div className="mt-auto">
          <Button 
            variant="outline-primary" 
            size="sm" 
            className="me-2 mb-1"
            onClick={() => onEdit(movie)}
          >
            <i className="fas fa-edit me-1"></i>
            Edit
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={handleDeleteClick}
          >
            <i className="fas fa-trash me-1"></i>
            Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MovieAdminCard;