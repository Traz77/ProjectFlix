// Component that displays a list of movies that can be scrolled horizontally
import React, { useRef } from 'react';
import ScrollableMovieCard from '../ScrollableMovieCard/ScrollableMovieCard';
import './ScrollableMovieList.css';

const ScrollableMovieList = ({ movies }) => {
  const listRef = useRef(null);
  
  const handleScroll = (direction) => {
    const scrollAmount = 300; 
    if (listRef.current) {
      const scrollLeft = direction === 'left' 
        ? listRef.current.scrollLeft - scrollAmount
        : listRef.current.scrollLeft + scrollAmount;
        
      listRef.current.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="scrollable-movie-list-container">
      <button className="scroll-button left" onClick={() => handleScroll('left')}>‹</button>
      <div className="scrollable-movie-list" ref={listRef}>
        {movies.map((movie) => (
          <div key={movie._id} className="movie-card-wrapper">
            <ScrollableMovieCard movie={movie} />
          </div>
        ))}
      </div>
      <button className="scroll-button right" onClick={() => handleScroll('right')}>›</button>
    </div>
  );
};
export default ScrollableMovieList;