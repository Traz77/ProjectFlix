// Component for displaying movie details in a modal
import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { api } from '../../services/api';
import ScrollableMovieList from '../Movies/ScrollableMovieList';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import './MovieModal.css';

const MovieModal = ({ show, handleClose, movie }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasRecommendations, setHasRecommendations] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  useEffect(() => {
    // Fetch recommendations for the current movie
    const fetchRecommendations = async () => {
      // Only fetch recommendations if the modal is open and a movie is selected
      if (show && movie?._id) {
        setLoading(true);
        try {
          // Get token from local storage
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No token found');
          }

          // Fetch recommendations for the current movie and current user
          const response = await api.getRecommendations(movie._id, token);

          // Set recommendations if available
          if (response.data && response.data.movies) {
            setRecommendations(response.data.movies);
            setHasRecommendations(response.data.movies.length > 0);
          } else {
            setHasRecommendations(false);
            setRecommendations([]);
          }
          setError(null);
        } catch (err) {
          console.error('Error fetching recommendations:', err);
          setHasRecommendations(false);
          setError(err.message);
          setRecommendations([]);
        } finally {
          setLoading(false);
        }
      } else {
        setHasRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [show, movie?._id]);

  // Get the embed URL for the trailer or movie file
  const getEmbedUrl = (url) => {
    if (!url) return null;

    // Check if URL is a YouTube link
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);

    // If YouTube, return the embed URL
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    }

    // If not YouTube, check if it's a static file path
    if (url.startsWith('/static/')) {
      const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      return `${serverUrl}${url}`;
    }

    return url;
  };

  // Handle play button click
  const handlePlayClick = async () => {
    try {
      // Check if movie has a movie file available
      if (movie.movieFile && movie.movieFile.length > 0) {
        // Update watch history and show video player
        await api.postRecommendation(movie._id);
        setError(null);
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

  const handleVideoClose = () => {
    setShowVideo(false);
  };
  return (
    <Modal show={show} onHide={handleClose} className="movie-modal" size="lg">
      <Modal.Body className="p-0">
        <div className="modal-header-image">
          {movie.trailer ? (
            <iframe
              src={getEmbedUrl(movie.trailer)}
              title={movie.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="movie-trailer"
            />
          ) : (
            <img src={movie.mainImage} alt={movie.name} />
          )}
          <div className="modal-header-overlay">
            <button className="close-button" onClick={handleClose}>×</button>
            <div className="header-content">
              <h1>{movie.name}</h1>
              <div className="header-buttons">
                <button className="play-button" onClick={handlePlayClick}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 2.69127C4 1.93067 4.81547 1.44851 5.48192 1.81506L22.4069 11.1238C23.0977 11.5037 23.0977 12.4963 22.4069 12.8762L5.48192 22.1849C4.81546 22.5515 4 22.0693 4 21.3087V2.69127Z"
                      fill="currentColor"
                    />
                  </svg>
                  Play
                </button>
                {error && <div className={`error-toast ${error ? 'show' : ''}`}>{error}</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-content-body">
          <div className="modal-info">
            <div className="meta-data">
              <span className="year">{movie.year}</span>
              <span className="duration">{movie.duration}m</span>
              <span className="quality">HD</span>
            </div>
            <p className="description">{movie.description}</p>
          </div>
          <div className="modal-details">
            <p>
              <span>Director:</span> {movie.director}
            </p>
            <p>
              <span>Cast:</span> {movie.cast?.join(', ')}
            </p>
            <p>
              <span>Categories:</span> {movie.categories?.join(', ')}
            </p>
          </div>
        </div>

        {hasRecommendations && (
          <div className="recommendations-section">
            {loading ? (
              <p className="recommendations-message">Loading recommendations...</p>
            ) : (
              <>
                <h3 className="recommendations-title">Recommended Movies</h3>
                <ScrollableMovieList movies={recommendations} />
              </>
            )}
          </div>
        )}
      </Modal.Body>
      <VideoPlayer
        show={showVideo}
        handleClose={handleVideoClose}
        videoPath={movie.movieFile}
        movieName={movie.name}
      />
    </Modal>
  );
};
export default MovieModal;