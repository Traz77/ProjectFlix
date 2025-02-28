const { get } = require('http');
const UserServices = require('../services/UserServices');
const mongoose = require('mongoose');

const createUser = async (req, res) => {
    const { email, password, firstName, lastName, photo } = req.body;

    // Must have fields to create a user 
    if (!req.body.email || !req.body.password || !req.body.firstName || !req.body.lastName) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Check for valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    // Check for valid password length
    if (req.body.password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    try {
        const user = await UserServices.createUser(email, password, firstName, lastName, photo);
        return res.status(201).json(user);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
 };

// Retrieve all users 
const getUsers = async (req, res) => {
    const users = await UserServices.getUsers();
    return res.status(200).json(users);
};

// Retrieve a single user 
const getUserById = async (req, res) => {
    try {
        const user = await UserServices.getUserById(req.params.id);
        if (user) {
            return res.status(200).json(user);
        }
    } catch (error) {
        return res.status(404).json({ error: "User not found" });
    }
};

//Used to get a user by their email
const getUserByEmail = async (req, res) => {
    try {
        const user = await UserServices.getUserByEmail(req.params.email);
        if (user) {
            return res.status(200).json(user);
        }
        return res.status(404).json({ error: "User not found" });
    } catch (error) {
        return res.status(404).json({ error: "User not found" });
    }
};

//Used to update a user by their id
const updateUser = async (req, res) => {
    try{
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }
        if (req.body.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(req.body.email)) {
                return res.status(400).json({ error: "Invalid email format" });
            }
        }
        if (req.body.password) {
            if (req.body.password.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters" });
            }
        }
        // Movies validation
        if (req.body.moviesId) {
            // Check if it's an array
            if (!Array.isArray(req.body.moviesId)) {
                return res.status(400).json({ error: "Movies must be an array" });
            }

            // Validate each movie ID format
            for (const movieId of req.body.moviesId) {
                if (!mongoose.Types.ObjectId.isValid(movieId)) {
                    return res.status(400).json({ error: "Invalid movie ID format" });
                }
            }
        }
        await UserServices.updateUser(
            req.params.id,
            req.body.email,
            req.body.password,
            req.body.firstName,
            req.body.lastName,
            req.body.photo,
            req.body.watchHistory
        );

        return res.status(204).send();
    } catch (error) {
        if (error.message === "user not found") {
            return res.status(404).json({ error: "User not found" });
        }
        if (error.message === "one or more fields are taken") {
            return res.status(400).json({ error: "one or more fields are taken" });
        }
        return res.status(500).json({ error: "Error updating user "});
    }
};

// Used to sign in a user
const signIn = async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const user = await UserServices.signIn(req.body.email, req.body.password);
        if (user) {
            // Fix: Return both token and userId from the UserServices.signIn response
            return res.status(200).json({
                token: user.token,    // Changed from user._id to user.token
                userId: user.userId   // Added userId
            });
        }
    } catch (error) {
        if (error.message === "invalid email or password") {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        return res.status(500).json({ error: "Error signing in" });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await UserServices.getUserById(req.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Return user data with role
        res.json({
            ...user.toJSON(),
            role: user.role || 'user' // Default to 'user' if role is not set
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getWatchHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const watchHistory = await UserServices.getWatchHistory(userId);
        return res.status(200).json(watchHistory);
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(500).json({ error: "Error retrieving watch history" });
    }
};

module.exports = { createUser, getUsers, getUserById, getUserByEmail, updateUser, signIn , getCurrentUser, getWatchHistory};