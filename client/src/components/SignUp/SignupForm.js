// Component for the signup form
import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { api } from '../../services/api';
import Header from '../Header/Header';
import './SignupForm.css';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create a new user
      await api.createUser(formData);
      // Navigate to login after successful signup
      window.location.href = '/login';
    } catch (err) {
      setError('Sorry, that email is already taken.');
    }
  };

  return (
    <div className="page-container signup-wrapper">
        <Header />
      <Container>
        <div className="signup-form-container">
          <h1>Create your PROJECTFLIX account</h1>
          {error && <div className="alert alert-danger">{error}</div>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </Form.Group>
            <Button variant="danger" type="submit" className="w-100">
              Sign Up
            </Button>
          </Form>
          <div className="signup-help">
            <span>Already have an account? </span>
            <a href="/login">Sign in</a>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SignupForm;