//Component for displaying all movies in the database.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import MovieCard from '../MovieCard/MovieCard';
import FeaturedPlayer from '../VideoPlayer/FeaturedPlayer';
import Footer from '../Footer/Footer';
import { Container } from 'react-bootstrap';
import { api } from '../../services/api';
import './MoviesPage.css';

const MoviesPage = ({ useCategories = false }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const token = localStorage.getItem('token');
        // If the user is not signed in redirect to login
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch movies or categories
        const response = useCategories ? 
          await api.getCategories() : 
          await api.getMovies();
        
        setCategories(response.data);
        
        // Select random movie with trailer for featured section
        const allMovies = response.data.flatMap(category => category.movies);
        const moviesWithTrailer = allMovies.filter(movie => movie.trailer);
        if (moviesWithTrailer.length > 0) {
          const randomIndex = Math.floor(Math.random() * moviesWithTrailer.length);
          setFeaturedMovie(moviesWithTrailer[randomIndex]);
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to load movies');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [navigate, useCategories]);

  const handleSearchResults = (movies) => {
    setSearchResults(Array.isArray(movies) ? movies : []);
  };

  if (loading) return <div className="movies-page">Loading...</div>;
  if (error) return <div className="movies-page">{error}</div>;

  return (
    <div className="movies-page">
      <Header onSearchResults={handleSearchResults} />
      {featuredMovie && <FeaturedPlayer movie={featuredMovie} />}
      <Container fluid className="movies-container">
        {searchResults.length > 0 ? (
          <div className="category-section">
            <h2>Search Results</h2>
            <div className="movies-row">
              {searchResults.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.categoryId || category._id} className="category-section">
              <h2>{category.categoryName || category.name}</h2>
              <div className="movies-row">
                {category.movies.map((movie) => (
                  <MovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            </div>
          ))
        )}
      </Container>
      <Footer />
    </div>
  );
};

export default MoviesPage;