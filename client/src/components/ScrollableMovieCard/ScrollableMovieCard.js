import React, { useState } from 'react';
import MovieModal from '../MovieModal/MovieModal';
import './ScrollableMovieCard.css';

const ScrollableMovieCard = ({ movie, onMoviePlay, onMovieClick }) => {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    // If onMovieClick is provided (we're inside a modal), call it with the movie
    // and don't open a nested modal
    if (onMovieClick) {
      onMovieClick(movie);
    } else {
      // Otherwise open our own modal (standalone card)
      setShowModal(true);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://place-hold.it/245x140';

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    return `${serverUrl}${imagePath}`;
  };

  return (
    <>
      <div
        className="scrollable-movie-card"
        onClick={handleClick}
        style={{ pointerEvents: 'auto' }}
      >
        <img
          src={getImageUrl(movie.mainImage)}
          alt={movie.name}
          className="movie-card-img"
        />
      </div>
      {/* Only render nested modal if no onMovieClick callback (standalone usage) */}
      {!onMovieClick && showModal && (
        <MovieModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          movie={movie}
          onMoviePlay={onMoviePlay}
        />
      )}
    </>
  );
};

export default ScrollableMovieCard;