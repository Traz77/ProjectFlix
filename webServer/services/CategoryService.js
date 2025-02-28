const Category = require('../models/CategoryModel');
const mongoose = require('mongoose');
const Movie = require('../models/MovieModel');
const User = require('../models/UserModel');

const createCategory = async (name, promoted, movies) => {
    const category = new Category({ name, promoted });

    // If movies are given, add them to the category movies field and vice versa
    if (movies && movies.length > 0) {
        for (const movieToAdd of movies) {
            const movie = await Movie.findById(movieToAdd.movieId);
            if (movie) {
                // Add movieId to category's movies array
                category.movies.push({ movieId: movie._id });
                // Add category to movie's categories array
                movie.categories.push({ categoryId: category._id });
                await movie.save();
            }
        }
    }
    await category.save();
    // Return in the correct format
    return await getCategoryById(category._id);
};

// Retrieve the category by its Id and return in the correct populated format 
const getCategoryById = async (id) => {
    try { 
        return await Category.findById(id).populate({
            path: "movies.movieId",
            select: "name id"
        });
    } catch (error) {
        throw new Error('Category is Invalid');
    }
};

// Retrieve all categories with full movie objects
const getCategories = async () => {
    // Get categories with populated movie data
    const categories = await Category.find({}).populate({
        path: "movies.movieId",
        populate: {
            path: "categories.categoryId"
        }
    });

    return categories.map(category => ({
        _id: category._id,
        name: category.name,
        promoted: category.promoted,
        movies: category.movies.map(movie => movie.movieId) 
    }));
};

// Update category name / promoted fields 
const updateCategory = async (id, updates) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw {status: 400, message: "400 Bad Request"};
    }
    if (updates.name === undefined && updates.promoted === undefined) {
        throw { status: 400, message: "name / promoted must be updated" };
    }

    const category = await Category.findById(id);

    // The category to update is not in the database 
    if (!category) {
        throw { status: 404, message: "Category not found" };
    }

    // Name is not valid if another category has the same name as its unique 
    if (updates.name !== undefined) {
        const CheckDuplicateCategory = await Category.findOne({ name: updates.name });
        if (CheckDuplicateCategory && CheckDuplicateCategory._id.toString() !== id) {
            throw { status: 400, message: "Category name must be unique" };
        }
        category.name = updates.name;
    }
    if (updates.promoted !== undefined) {
        category.promoted = updates.promoted;
    }

    await category.save();
    // Return in the correct Json format 
    return await getCategoryById(category._id);
};

// Delete a category from databse, also delete the category for every movie that has it 
const deleteCategory = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw {status : 400, message: "400 Bad Request"};
    }

    const category = await Category.findById(id);
    if (!category) return null;

    // Get all movies the category has 
    const movieIds = category.movies.map(movie => movie.movieId);

    // Update all the movies, remove the category from their categories field
    await Movie.updateMany (
          { _id: { $in: movieIds } },
          { $pull: { categories: { categoryId: category._id } } }, 
          { multi: true } 
    );

    await Category.findByIdAndDelete(id);

    return category;
};

// Get 20 random movies from the category and only if the category is promoted, and only if the user that asks for it hasn't watched the movies 
const randomMoviesInPromotedCategory = async (category, userId, limit = 20) => {
    try {
        if (!category.promoted) {
            return [];
        }

        // Get the user that asked for the movies 
        const user = await User.findById(userId);
        // Get all the categories movies
        const categoryMovies = category.movies.map(m => m.movieId);
        // Get all the movies the user has watched 
        const watchedMovieIds = user.watchHistory.map(h => h.movieId.toString());

        // Filter to only the movies that has the category in their field And the user hasn't watched them yet 
        const unwatchedMovies = categoryMovies.filter(movie => 
            !watchedMovieIds.includes(movie._id.toString())
        );

        // The returned movies 
        const randomMoviesInCategory = [];

        // Randomize the movies 
        while (randomMoviesInCategory.length < limit && unwatchedMovies.length > 0) {
            // Generate random index for the selection (we use random number from 0 to 1 * the movies length, and return its floor index)
            const Index = Math.floor(Math.random() * unwatchedMovies.length);
            // Put the movie in the returned array
            const Movie = unwatchedMovies[Index];
            // Remove the movie from the array of the user's watch list 
            unwatchedMovies.splice(Index, 1);
            
            // Populate and push the movie to returned array
            const populatedMovie = await Movie.populate("categories.categoryId");
            randomMoviesInCategory.push({ movieId: populatedMovie });
        }

        return randomMoviesInCategory;
    } catch (error) {
        console.error("Random movies in promoted category error:", error);
        throw error;
    }
};




module.exports = { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory, randomMoviesInPromotedCategory }