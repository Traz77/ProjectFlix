//Home Page for unsigned users
import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import './HomePage.css';

const HomePage = () => {
  //navigate to the signup page
  const navigate = useNavigate();
  //return the home page
  return (
    <div className="home-page">
      <Header />
      <Container className="hero-section">
        <div className="hero-content">
          <h1>Unlimited movies, TV shows, and more</h1>
          <h2>Watch anywhere. Cancel anytime.</h2>
          <div className="cta-section">
            <Button
              variant="danger"
              size="lg"
              onClick={() => navigate('/signup')}
              className="get-started-btn"
            >
              Get Started
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;