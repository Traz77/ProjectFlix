// A component that displays the management page for the admin user.
import React, { useEffect, useState } from 'react';
import { Container, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import MovieManagement from './MovieManagement';
import CategoryManagement from './CategoryManagement';
import ExistingContentManagement from './ExistingContentManagement';
import { api } from '../../services/api';
import './ManagementPage.css';

const ManagementPage = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('movies');
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') !== 'light');

  // Theme toggle function
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.body.classList.toggle('light-mode', !newMode);
  };

  // Initialize theme
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    const isLight = theme === 'light';
    setIsDarkMode(!isLight);
    document.body.classList.toggle('light-mode', isLight);
  }, []);

  useEffect(() => {
    // Check if the user is an admin by verifying the user's role
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        // If the token is not present, redirect the user to the login page 
        if (!token) {
          navigate('/login');
          return;
        }

        // Get the current user's role
        const response = await api.getCurrentUser();
        if (response.data.role !== 'admin') {
          // If the user is not an admin, redirect the user to the movies page
          navigate('/movies');
          return;
        }
        setIsAdmin(true);
      } catch (error) {
        navigate('/movies');
      }
    };

    checkAdminAccess();
  }, [navigate]);

  const renderContent = () => {
    switch(activeTab) {
      case 'movies':
        return <MovieManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'existing':
        return <ExistingContentManagement />;
      default:
        return <MovieManagement />;
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="management-page">
      <Container fluid className="px-4">
        {/* Header Section */}
        <div className="management-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">
                <i className="fas fa-cogs me-3"></i>
                Admin Dashboard
              </h1>
              <p className="page-subtitle">Manage your ProjectFlix content</p>
            </div>
            
            <div className="header-buttons">
              <Button 
                variant="outline-danger" 
                onClick={() => navigate('/')}
                className="back-button"
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back to Home
              </Button>
              
              <Button 
                onClick={toggleTheme} 
                variant="outline-light" 
                className="theme-toggle-admin"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="stats-section mb-4">
          <div className="row g-3">
            <div className="col-md-4">
              <Card 
                className={`stat-card clickable-card ${activeTab === 'movies' ? 'active' : ''}`}
                onClick={() => setActiveTab('movies')}
              >
                <Card.Body className="text-center">
                  <i className="fas fa-film stat-icon"></i>
                  <h3 className="stat-number">Movies</h3>
                  <p className="stat-label">Add Movies</p>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-4">
              <Card 
                className={`stat-card clickable-card ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
              >
                <Card.Body className="text-center">
                  <i className="fas fa-folder stat-icon"></i>
                  <h3 className="stat-number">Categories</h3>
                  <p className="stat-label">Add Categories</p>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-4">
              <Card
                className={`stat-card clickable-card ${activeTab === 'existing' ? 'active' : ''}`}
                onClick={() => setActiveTab('existing')}
              >
                <Card.Body className="text-center">
                  <i className="fas fa-edit stat-icon"></i>
                  <h3 className="stat-number">Edit Content</h3>
                  <p className="stat-label">Manage Existing</p>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="main-content-card">
          <Card.Body>
            <div className="tab-content-wrapper">
              {renderContent()}
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ManagementPage;