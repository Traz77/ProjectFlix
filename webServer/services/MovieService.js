const Movie = require('../models/MovieModel');
const User = require('../models/UserModel');
const Category = require('../models/CategoryModel');
const CategoryService = require ('../services/CategoryService');
const watchHistoryService = require ('../services/WatchHistoryService');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Generate a unique number ID that will fit the c++ recommendation system
async function generateUniqueId() {
    // Get the last movie added
    const lastMovie = await Movie.findOne().sort({ id: -1 }); 
    // Increment the last ID or start from 1, that way, all stays unique
    return lastMovie ? lastMovie.id + 1 : 1; 
}

const createMovie = async (movieData, files) => {
    try {
        const { name, duration, year, description, director, cast, categories } = movieData;
        
        // Process uploaded files
        const mainImagePath = files.mainImage ? `/static/images/${files.mainImage[0].filename}` : '';
        const trailerPath = files.trailer ? `/static/trailers/${files.trailer[0].filename}` : '';
        const imagesPath = files.images ? 
            files.images.map(file => `/static/images/${file.filename}`) : [];
        const movieFilePath = files.movieFile ? 
            `/static/videos/${files.movieFile[0].filename}` : '';

        // Parse categories safely
        let parsedCategories;
        try {
            // Log the raw categories value for debugging
            console.log('Raw categories:', categories);
            
            // Handle different category formats
            if (typeof categories === 'string') {
                try {
                    parsedCategories = JSON.parse(categories);
                } catch (e) {
                    console.error('Category parsing error:', e);
                    throw new Error('invalid category format');
                }
            } else if (Array.isArray(categories)) {
                parsedCategories = categories;
            } else {
                parsedCategories = [];
            }
        } catch (err) {
            console.error('Category processing error:', err);
            throw new Error('invalid category format');
        }

        const customId = await generateUniqueId();
        
        const newMovie = new Movie({
            id: customId,
            name,
            duration,
            year,
            description: description || '',
            director: director || '',
            cast: typeof cast === 'string' ? JSON.parse(cast) : cast || [],
            mainImage: mainImagePath,
            images: imagesPath,
            trailer: trailerPath,
            movieFile: movieFilePath,
        });

        await checkAllCategoriesAreValid(newMovie, parsedCategories);
        await addMovieToGivenCategories(newMovie, parsedCategories);
        await newMovie.save();

        return newMovie.populate("categories.categoryId");
    } catch (error) {
        console.error('Create movie error:', error);
        throw error;
    }
};

// A method that checks that all categories are in database before making a change 
const checkAllCategoriesAreValid = async (movie, categories) => {
    if (categories && categories.length > 0) {
        for (const categoryCheck of categories) {
            if (!mongoose.Types.ObjectId.isValid(categoryCheck.categoryId)) {
                throw new Error("invalid category format");
            }
            const category = await Category.findById(categoryCheck.categoryId);
            if (!category) {
                throw new Error("category does not exist");
            }
        }
    }
};

// A method that remove a movie from all categories 
const removeMovieFromAllCategories = async (movieToRemove) => {
    const categoryIds = movieToRemove.categories.map(category => category.categoryId); 
        
    await Category.updateMany(
        { _id: { $in: categoryIds } },
        { $pull: { movies: { movieId: movieToRemove._id } } },
        { multi: true }
    );
};

// Retrieve a movie by its custom c++ server ID 
const getMovieByCustomID = async (id) => {
    const movie = await Movie.findOne
    ({ id }).populate('categories');
    return movie;
};

// Add movie to the categories 
const addMovieToGivenCategories = async (movieToAdd, categories) => {
    if (categories && categories.length > 0) {
        for (const categoryCheck of categories) {
            // Find the category
            const category = await Category.findById(categoryCheck.categoryId);
            if (category) {
                // add the categorie to the movie 
                movieToAdd.categories.push({ categoryId: category._id });
                // add the movie to the category
                category.movies.push({ movieId: movieToAdd._id });
                await category.save();
            }
        }
    }
};

// Retrieve a movie by its custom ID
const getMovieById = async (id) => {
    const movie = await Movie.findById(id).populate("categories.categoryId");
    return movie;
};

// Retrieve the movie by the C++ custom ID
const getMovieByCustomId = async (id) => {
    const movie = await Movie.findOne
    ({ id }).populate("categories");
    return movie;
};

// Update a movie PUT command
const updateMovie = async (movieData, id, files) => {
    const { name, duration, year, description, director, cast, categories } = movieData;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw { status: 400, message: "Invalid MongoDB ID" };
    }
    
    const movieToUpdate = await Movie.findById(id).populate("categories.categoryId");

    if (!movieToUpdate) {
        throw { status: 404, message: "Movie to update not found" };
    }

    // Process uploaded files
    if (files) {
        if (files.mainImage) {
            // Delete old image if exists
            if (movieToUpdate.mainImage) {
                const oldPath = path.join(__dirname, '../public/uploads', movieToUpdate.mainImage);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            movieToUpdate.mainImage = `/static/images/${files.mainImage[0].filename}`;
        }

        if (files.trailer) {
            // Delete old trailer if exists
            if (movieToUpdate.trailer) {
                const oldPath = path.join(__dirname, '../public/uploads', movieToUpdate.trailer);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            movieToUpdate.trailer = `/static/trailers/${files.trailer[0].filename}`;
        }

        if (files.movieFile) {
            // Delete old movie file if exists
            if (movieToUpdate.movieFile) {
                const oldPath = path.join(__dirname, '../public/uploads', movieToUpdate.movieFile);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            movieToUpdate.movieFile = `/static/videos/${files.movieFile[0].filename}`;
        }

        if (files.images) {
            // Delete old images
            if (movieToUpdate.images.length > 0) {
                movieToUpdate.images.forEach(imagePath => {
                    const oldPath = path.join(__dirname, '../public/uploads', imagePath);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                });
            }
            movieToUpdate.images = files.images.map(file => `/static/images/${file.filename}`);
        }
    }

    // Update other fields
    await checkAllCategoriesAreValid(movieToUpdate, categories);
    await removeMovieFromAllCategories(movieToUpdate);
    movieToUpdate.categories = [];
    await addMovieToGivenCategories(movieToUpdate, categories);

    movieToUpdate.name = name;
    movieToUpdate.duration = duration;
    movieToUpdate.year = year;
    movieToUpdate.description = description || "";
    movieToUpdate.director = director || "";
    movieToUpdate.cast = cast || [];

    await movieToUpdate.save();
    return await Movie.findById(movieToUpdate._id).populate("categories.categoryId");
};

// Delete a movie by its custom ID
const deleteMovie = async (id) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw { status: 400, message: "Invalid MongoDB ID" };
        }
        
        // Find the movie to delete
        const movieToDelete = await Movie.findById(id);
        
        if (!movieToDelete) {
            return null;
        }

        if (movieToDelete.mainImage) {
            const mainImagePath = path.join(__dirname, '../public/uploads', movieToDelete.mainImage);
            if (fs.existsSync(mainImagePath)) {
                fs.unlinkSync(mainImagePath);
            }
        }

        if (movieToDelete.trailer) {
            const trailerPath = path.join(__dirname, '../public/uploads', movieToDelete.trailer);
            if (fs.existsSync(trailerPath)) {
                fs.unlinkSync(trailerPath);
            }
        }

        if (movieToDelete.images && movieToDelete.images.length > 0) {
            movieToDelete.images.forEach(imagePath => {
                const fullPath = path.join(__dirname, '../public/uploads', imagePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            });
        }

        if (movieToDelete.movieFile) {
            const movieFilePath = path.join(__dirname, '../public/uploads', movieToDelete.movieFile);
            if (fs.existsSync(movieFilePath)) {
                fs.unlinkSync(movieFilePath);
            }
        }
        
        removeMovieFromAllCategories(movieToDelete);
    
        // Find users who have this movie in watchHistory
        const usersWithMovie = await User.find({ "watchHistory.movieId": movieToDelete._id });
      
        // Remove movie from users' watchHistory and remove from the C++ server 
        const recommendationService = require('./RecommendationService'); 
        for (const user of usersWithMovie) {
            await User.updateOne(
                { _id: user._id },
                { $pull: { watchHistory: { movieId: movieToDelete._id } } }
            );
            // Delete from the C++ 
            await recommendationService.sendCommand(user._id, movieToDelete._id, 'DELETE');
        }
        
        // Delete movie and return it
        const deletedMovie = await Movie.findByIdAndDelete(id);
        return deletedMovie;
    } catch (error) {
        console.error("Delete movie error:", error);
        throw error;
    }
};

const searchMovies = async (searchQuery) => {
    try {
        // Make no differ from case ( A and a are the same )
        const regex = new RegExp(searchQuery, 'i');

        // Check if the search query is a number
        const isNumeric = !isNaN(searchQuery);

        // find matching categories
        const matchingCategories = await Category.find({
            name: { $regex: regex }
        });

        // Search in fields that are strings
        const query = {
            $or: [
                { name: { $regex: regex } }, 
                { description: { $regex: regex } }, 
                { director: { $regex: regex } }, 
                { cast: { $regex: regex } }, 
                { mainImage: { $regex: regex } }, 
                { images: { $regex: regex } }, 
                { trailer: { $regex: regex } },
                
            ]
        };

        // Add category search if we found matching categories
        if (matchingCategories.length > 0) {
            query.$or.push({ 
                'categories.categoryId': { 
                    $in: matchingCategories.map(cat => cat._id) 
                }
            });
        }

        // Search in fields that are numbers 
        if (isNumeric) {
            const numericValue = Number(searchQuery);
            query.$or.push({ id: numericValue }); 
            query.$or.push({ duration: numericValue }); 
            query.$or.push({ year: numericValue }); 
        }

        const movies = await Movie.find(query).populate('categories.categoryId');
        return movies;

    } catch (error) {
      console.error('Error in searchMovies service:', error);
      throw error;
    }
};

// Get all categories that are promoted with 20 random movies the user hasnt watched, and his 20 last watched movies shuffled
const getMoviesList = async (userId) => {
    try {
        // Find promoted categories
        const promotedCategories = await Category.find({ promoted: true }).populate({
            path: 'movies.movieId',
        });

        const result = [];

        // Get the movies from each category
        for (const category of promotedCategories) {
            const randomMoviesUserDidntWatch = await CategoryService.randomMoviesInPromotedCategory(
                category,
                userId
            );
            result.push({
                categoryName: category.name,
                categoryId: category._id,
                movies: randomMoviesUserDidntWatch.map(entry => entry.movieId),
            });
        }

        // Add the movies from the watch hsitory 
        const watchedMovies = await watchHistoryService.getRecentWatchHistory(userId);
        result.push({
            categoryName: 'Watched Movies',
            movies: watchedMovies.map(entry => entry.movieId),
        });

        return result;
    } catch (error) {
        console.error('Get movies list error:', error);
        throw error;
    }
};

module.exports = { createMovie, getMovieById, getMovieByCustomId, updateMovie, deleteMovie, searchMovies, getMoviesList }