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

        // Sync with Recommendation Engine asynchronously (fire and forget)

        recommendationService.sendCommand(user._id, null, 'POST')
            .catch(error => {
                console.error(`Warning: Failed to sync new user with recommendation engine: ${error.message}`);
            });

        // Generate token only after successful sync
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

                // Get the movie - handle both MongoDB ObjectIds and custom numeric IDs
                let current;
                if (mongoose.Types.ObjectId.isValid(movieId)) {
                    // It's a valid MongoDB ObjectId
                    current = await MovieService.getMovieById(movieId);
                } else {
                    // It's likely a custom numeric ID from the C++ server
                    current = await MovieService.getMovieByCustomId(movieId);
                }

                if (!current) {
                    throw new Error('movie not found');
                }

                // Use the MongoDB _id for storage and comparison
                const mongoDbId = current._id.toString();

                // Only add to watch history if not already present
                const exists = user.watchHistory.some(watch => watch.movieId && watch.movieId.toString() === mongoDbId);


                if (!exists) {

                    // Store the MongoDB ObjectId in watchHistory
                    user.watchHistory.push({ movieId: current._id, watchedAt: watchedAt });

                    // Mark as modified to ensure Mongoose saves it
                    user.markModified('watchHistory');
                    // Add to C++ server the user has watched the movie - use custom ID
                    // Sync asynchronously

                    recommendationService.sendCommand(user._id, current._id, 'PATCH')
                        .catch(cmdError => {
                            console.error(`\n========== WATCH HISTORY SYNC ERROR ==========`);
                            console.error(`Failed to sync watch history with Recommendation Engine`);
                            console.error(`Error: ${cmdError.message}`);
                            console.error(`User MongoDB ID: ${user._id}`);
                            console.error(`User Email: ${user.email}`);
                            console.error(`Movie MongoDB ID: ${current._id}`);
                            console.error(`Movie Name: ${current.name}`);
                            console.error(`Movie Custom ID: ${current.id || 'NOT SET'}`);
                            console.error(`Full Error Stack:`, cmdError.stack);
                            console.error(`==============================================\n`);
                        });
                } else {

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
        throw error; // Re-throw to handle in controller
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







