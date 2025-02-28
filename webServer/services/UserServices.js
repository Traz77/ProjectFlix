const bcrypt = require('bcryptjs');
const { generateToken } = require("../jwt");
const User = require('../models/UserModel');
const MovieService = require('../services/MovieService');
const mongoose = require('mongoose');
const recommendationService = require('./RecommendationService');

// Used to create a user in the database
const createUser = async (email, password, firstName, lastName, photo) => {
    try {
        // Check if user with that email already exists
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            throw new Error('Email already exists');
        }
        // Creating a hashed password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create a new user
        const userData = {
            email,
            password: hashedPassword,
            firstName,
            lastName
        };
        
        if (photo) {
            userData.photo = photo;
        }
        
        const user = new User(userData);
        await user.save();
        await recommendationService.sendCommand(user._id, null, 'POST');

        // Generate token only after successful user creation
        const token = generateToken(user._id);
        
        return { 
            user: user.toJSON(),
            token 
        };
    } catch (error) {
        console.error('Create user error:', error);
        throw error;
    }
};

// Retrieve all users 
const getUsers = async () => { return await User.find({}).populate('watchHistory.movieId', 'name'); };

// Retrieve specific user 
const getUserById = async (id) => {
    try {
        return await User.findById(id)
            .populate('watchHistory.movieId', 'name');
    } catch (error) {
        return null;
    }
};

const getUserByEmail = async (email) => {
    try {
        return await User.findOne({ email });
    } catch (error) {
        return null;
    }
};

// Used to update a user in the database
const updateUser = async (id, email, password, firstName, lastName, photo, watchHistory) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            throw new Error('user not found');
        }

        if (email) user.email = email;
        if (password) user.password = password;
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (photo) user.photo = photo;

        // Add movies to watch history if provided
        if (watchHistory && Array.isArray(watchHistory)) {
            for (const movie of watchHistory) {
                const movieId = movie.movieId;
                // Update date if given or set the current time 
                const watchedAt = movie.watchedAt || new Date();
                // Get the movie
                const current = await MovieService.getMovieById(movieId);
                if (!current) {
                    throw new Error('movie not found');
                }
                
                // Only add to watch history if not already present
                if (!user.watchHistory.some(watch => watch.movieId && watch.movieId.toString() === movieId)) {
                    user.watchHistory.push({ movieId: movieId, watchedAt: watchedAt });
                    // Add to C++ server the user has watched the movie 
                    await recommendationService.sendCommand(user._id, movieId, 'PATCH');
                }
            }
        }

        await user.save();
        return user;
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('one or more fields are taken');
        } else if (error.message === 'movie not found') {
            throw new Error('movie not found');
        }
        console.error('Update user error:', error);
    }
};

// Used to sign in a user
const signIn = async (email, password) => {
    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('invalid email or password');
      }
  
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('invalid email or password');
      }
  
      // Generate token
      const token = generateToken(user._id);
      return { userId: user._id, token };
    } catch (error) {
      throw new Error('invalid email or password');
    }
  };
  
  const getWatchHistory = async (userId) => {
    const user = await User.findById(userId)
        .populate({
            path: 'watchHistory.movieId',
            select: 'name id duration year description director cast mainImage images categories'
        });
    if (!user) {
        throw new Error('User not found');
    }
    return user.watchHistory.map(item => ({
        movieId: item.movieId._id,
        movie: item.movieId
    }));
};

module.exports = { createUser, getUsers, getUserById, updateUser, signIn, getUserByEmail, getWatchHistory };
    






