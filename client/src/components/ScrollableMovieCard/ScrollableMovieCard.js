import React, { useState } from 'react';
import MovieModal from '../MovieModal/MovieModal';
import './ScrollableMovieCard.css';

const ScrollableMovieCard = ({ movie }) => {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    setShowModal(true);
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
      {showModal && (
        <MovieModal 
          show={showModal} 
          handleClose={() => setShowModal(false)} 
          movie={movie}
        />
      )}
    </>
  );
};

export default ScrollableMovieCard;