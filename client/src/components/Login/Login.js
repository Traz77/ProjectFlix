//Login component to allow users to login to the application
import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { api } from '../../services/api';
import Header from '../Header/Header';
import './Login.css';

const Login = () => {
  //state for email input
  const [email, setEmail] = useState('');
  //state for password input
  const [password, setPassword] = useState('');
  //state for error message
  const [error, setError] = useState('');

  //function to handle the form submission
  const handleSubmit = async (e) => {
    //prevent the default form submission
    e.preventDefault();
    try {
      //send the login request to the server
      const response = await api.signIn(email, password);
      //check if the response contains a token
      if (response.data && response.data.token) {
        //save the token and user id to local storage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        //redirect to the home page
        window.location.href = '/';
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      //log the error to the console
      console.error('Login error:', err);
      setError('Invalid email or password');
    }
  };

  //return the login form
  return (
    <div className="page-container login-wrapper">
      <Header />
      <Container>
        <div className="login-form-container">
          <h1>Sign In</h1>
          {error && <div className="alert alert-danger">{error}</div>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="danger" type="submit" className="w-100">
              Sign In
            </Button>

            <Form.Group className="mb-3 mt-3">
              <Form.Check
                type="checkbox"
                label="Remember me"
                className="text-muted"
              />
            </Form.Group>
          </Form>

          <div className="login-help">
            <span>New to PROJECTFLIX? </span>
            <a href="/signup">Sign up now</a>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Login;