// Component for displaying a featured video or image with a title and description
import React from 'react';
import './FeaturedPlayer.css';

const FeaturedPlayer = ({ movie }) => {
  // Check if the body has the light-mode class to determine if the player should be light mode
  const isLightMode = document.body.classList.contains('light-mode');

  // Function to get the embed URL for the video
  const getEmbedUrl = (url) => {
    if (!url) return null;

    // Check if URL is a YouTube link
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);

    // If YouTube, return the embed URL
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&modestbranding=1&showinfo=0&controls=0&rel=0`;
    }

    // If not YouTube, check if it's a static file path
    if (url.startsWith('/static/')) {
      const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      return `${serverUrl}${url}`;
    }

    return url;
  };

  if (!movie) return null;
  return (
      <div className={`featured-player ${isLightMode ? 'light-mode' : ''}`}>
      {movie.trailer ? (
        <iframe
          className="featured-video"
          src={getEmbedUrl(movie.trailer)}
          title={movie.name}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <img
          src={movie.mainImage}
          alt={movie.name}
          className="featured-image"
        />
      )}
      <div className="featured-overlay">
        <div className="featured-content">
          <h1>{movie.name}</h1>
          <p>{movie.description}</p>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPlayer;