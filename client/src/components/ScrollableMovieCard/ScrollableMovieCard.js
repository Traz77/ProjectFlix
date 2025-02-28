import React, { useState } from 'react';
import MovieModal from '../MovieModal/MovieModal';
import './ScrollableMovieCard.css';

const ScrollableMovieCard = ({ movie }) => {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    setShowModal(true);
  };

  return (
    <>
      <div 
        className="scrollable-movie-card"
        onClick={handleClick}
        style={{ pointerEvents: 'auto' }}
      >
        <img 
          src={movie.mainImage || 'https://place-hold.it/245x140'} 
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