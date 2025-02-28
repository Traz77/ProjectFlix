//a header component that displays the logo, search bar, and navigation links.
import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Form } from 'react-bootstrap';
import { api } from '../../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Header = ({ onSearchResults }) => {
  //state for checking if the user has scrolled
  const [isScrolled, setIsScrolled] = useState(false);
  //state for search input
  const [search, setSearch] = useState('');
  //state for checking if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  //state for checking if the user is an admin
  const [isAdmin, setIsAdmin] = useState(false);
  //get the current location
  const location = useLocation();
  const navigate = useNavigate();
  //state for checking if the theme is dark mode
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') !== 'light');

  //function to toggle the theme
  const toggleTheme = () => {
    //set the theme to the opposite of the current theme
    const newMode = !isDarkMode;
    //save the theme to local storage
    setIsDarkMode(newMode);
    //add or remove the light-mode class to the body
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.body.classList.toggle('light-mode', !newMode);
  };

  useEffect(() => {
    //check if the theme is light mode
    const theme = localStorage.getItem('theme');
    //set the theme to light mode if it is not set
    const isLight = theme === 'light';
    //set the theme to the opposite of the current theme
    setIsDarkMode(!isLight);
    document.body.classList.toggle('light-mode', isLight);
  }, []);

  //check if the user is logged in and if the user is an admin
  useEffect(() => {
    //function to check if the user is logged in with jwt token
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);

      //check if the user is an admin
      if (token) {
        try {
          //get the current user
          const response = await api.getCurrentUser();
          //set the state to true if the user is an admin
          setIsAdmin(response.data.role === 'admin');
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };

    //call the  function to check if the user is logged in and if the user is an admin
    checkAuth();

    //add event listener to check if the user has scrolled
    const handleScroll = () => {
      //set the state to true if the user has scrolled
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  //function to handle logout
  const handleLogout = () => {
    //clear the jwt token and user id from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    //set the state to false
    setIsLoggedIn(false);
    setIsAdmin(false);
    //navigate to the home page for unsigned users
    window.location.href = '/';
  };

  //function to search for movies
  useEffect(() => {
    //set a timer to search for movies after 300ms in order to avoid making too many requests
    const Timer = setTimeout(async () => {
      //search for movies if the search input is not empty
      if (search.trim()) {
        try {
          //search for movies with the help of the api service
          const response = await api.searchMovies(search);
          //if there are search results, call the onSearchResults function
          if (response.data && onSearchResults) {
            //call the onSearchResults function with the search results
            onSearchResults(response.data.movies);
          }
        } catch (error) {
          console.error('Search error:', error);
        }
        //if there are no search results, call the onSearchResults function with an empty array
      } else if (onSearchResults) {
        onSearchResults([]);
      }
    }, 300);
    //clear the timer
    return () => clearTimeout(Timer);
    //call the function when the search input changes
  }, [search, onSearchResults]);

  //check if the current route is the management route for the admin
  const isManagementRoute = location.pathname === '/manage';

  //return the header component with the logo, search bar, and navigation links
  return (
    <Navbar className={`netflix-nav ${isScrolled ? 'scrolled' : ''}`} expand="lg" variant="dark" fixed="top">
      <Navbar.Brand href="/" className="netflix-logo">PROJECTFLIX</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          {isLoggedIn ? (
            <>
              <Nav.Link href="/movies" active={location.pathname === '/movies'}>Movies</Nav.Link>
              {isManagementRoute && <Nav.Link href="/manage" active>Management</Nav.Link>}
            </>
          ) : (
            <Nav.Link href="/" active={location.pathname === '/'}>Home</Nav.Link>
          )}
        </Nav>
        <Nav>
          {isLoggedIn ? (
            <>
              {!isManagementRoute && (
                <Form className="d-flex align-items-center me-3">
                  <Form.Control
                    type="search"
                    placeholder="Search movies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input me-2"
                  />
                </Form>
              )}
              <Nav.Link onClick={toggleTheme} className="theme-toggle">
                {isDarkMode ? '☀️' : '🌙'}
              </Nav.Link>
              {isAdmin && (
                <Nav.Link href="/manage" className="manage-link">Manage</Nav.Link>
              )}
              <Nav.Link onClick={handleLogout} className="logout-link">Logout</Nav.Link>
            </>
          ) : (
            <Nav.Link href="/login" className="signin-link">Sign In</Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;