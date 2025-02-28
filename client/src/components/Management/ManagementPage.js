// A component that displays the management page for the admin user.
import React, { useEffect, useState } from 'react';
import { Container, Tabs, Tab, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import MovieManagement from './MovieManagement';
import CategoryManagement from './CategoryManagement';
import ExistingContentManagement from './ExistingContentManagement';
import { api } from '../../services/api';
import './ManagementPage.css';

const ManagementPage = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="management-page">
      <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Content Management</h1>
        <Button 
            variant="outline-light" 
            onClick={() => navigate('/')}
            className="back-button"
          >
            ← Back to Home
          </Button>
      </div>
        <Tabs defaultActiveKey="movies" className="mb-4">
          <Tab eventKey="movies" title="Movies">
            <MovieManagement />
          </Tab>
          <Tab eventKey="categories" title="Categories">
            <CategoryManagement />
          </Tab>
          <Tab eventKey="existing" title="Existing Content">
            <ExistingContentManagement />
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
};

export default ManagementPage;