// Component for displaying a movie card with hover effect
import React, { useState, useRef, useEffect } from 'react';
import MovieModal from '../MovieModal/MovieModal';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import { api } from '../../services/api';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState(null);
  const cardRef = useRef(null);

  // Check the position of the card relative to the screen
  const checkPosition = () => {
    // If the card is not rendered yet, return
    if (!cardRef.current) return;
    // Get the position and dimensions of the card
    const rect = cardRef.current.getBoundingClientRect();
    // Get the viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newPosition = [];

    // Check horizontal edges
    if (rect.left < 200) {
      newPosition.push('left');
    } else if (rect.right > viewportWidth - 200) {
      newPosition.push('right');
    }

    // Check bottom edge
    if (rect.bottom > viewportHeight - 100) {
      newPosition.push('bottom');
    }

    // Set the position state based on the card position
    setPosition(newPosition.join('-'));
  };

  useEffect(() => {
    if (isHovered) {
      checkPosition();
    }
  }, [isHovered]);

  // Close the modal when the user clicks outside the modal
  const handleModalClose = () => {
    setShowModal(false);
    setIsHovered(false);
  };

  // Close the video player
  const handleVideoClose = () => {
    setShowVideo(false);
    setIsHovered(false);
  };

  // Handle the play button click
  const handlePlayClick = async (e) => {
    e.stopPropagation();
    try {
      // Check if the movie has a video file
      if (movie.movieFile) {
        // Update the watch history for the user when the play button is clicked
        await api.postRecommendation(movie._id);
        setError(null);
        // Show the video player
        setShowVideo(true);
      } else {
        setError('No video file available');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('Error updating watch history:', err);
      setError('Failed to update watch history');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle the more info button click
  const handleMoreInfo = (e) => {
    e.stopPropagation();
    setShowModal(true);
    setIsHovered(false);
  };

  // Add this helper function at the top of your component
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://place-hold.it/245x140';

    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // If it's a static path, prepend the API URL
    const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    return `${serverUrl}${imagePath}`;
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`movie-card ${isHovered ? "hovered" : ""}`}
        data-position={position}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={getImageUrl(movie.mainImage)}
          alt={movie.name}
          className="movie-card-img"
        />
        {isHovered && (
          <div className="movie-card-hover">
            <div className="movie-preview-container">
              <img
                src={getImageUrl(movie.mainImage)}
                alt={movie.name}
                className="movie-preview"
              />
            </div>
            <div className="movie-info">
              <h3 className="movie-title">{movie.name}</h3>
              <div className="movie-metadata">
                <span className="movie-year">{movie.year}</span>
                <span className="movie-duration">{movie.duration}m</span>
                <span className="movie-quality">HD</span>
              </div>
              <p className="movie-description">{movie.description}</p>
              <div className="movie-controls">
                <button className="play-button" onClick={handlePlayClick}>
                  <span>▶</span> Play
                </button>
                {error && <div className={`error-toast ${error ? 'show' : ''}`}>{error}</div>}
                <button className="more-info" onClick={handleMoreInfo}>
                  <span>ⓘ</span> More Info
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <MovieModal
        show={showModal}
        handleClose={handleModalClose}
        movie={movie}
      />
      <VideoPlayer
        show={showVideo}
        handleClose={handleVideoClose}
        videoPath={movie.movieFile}
        movieName={movie.name}
      />
    </>
  );
};

export default MovieCard;