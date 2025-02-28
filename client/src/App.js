// Main component that contains the routes for the application.
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Signup from './components/SignUp/SignupForm';
import MoviesPage from './components/Movies/MoviesPage';
import ManagementPage from './components/Management/ManagementPage';
import HomePage from './components/Home/HomePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const isLoggedIn = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!isLoggedIn ? <Signup /> : <Navigate to="/" />} />
        <Route path="/manage" element={
          <ProtectedRoute>
            <ManagementPage />
          </ProtectedRoute>
        } />
        <Route path="/movies" element={
          <ProtectedRoute>
            <MoviesPage useCategories={true} />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          isLoggedIn ? <MoviesPage useCategories={false} /> : <HomePage />
        } />
      </Routes>
    </Router>
  );
}

export default App;