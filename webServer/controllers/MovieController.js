const movieService = require('../services/MovieService');
const mongoose = require('mongoose');

const createMovie = async (req, res) => {
    try {
        // Parse fields from request body
        const { name, duration, year, description, director, mainImage, trailer } = req.body;

        // Validate required fields
        if (!name || !duration || !year) {
            return res.status(400).json({ error: "Name, duration and year are required" });
        }
        
        // Parse cast from JSON string
        let cast = [];
        try {
            cast = req.body.cast ? JSON.parse(req.body.cast) : [];
        } catch (e) {
            return res.status(400).json({ error: "Invalid cast format" });
        }

        // Parse categories from JSON string
        let categories = [];
        try {
            categories = req.body.categories ? JSON.parse(req.body.categories) : [];
        } catch (e) {
            return res.status(400).json({ error: "Invalid categories format" });
        }

        const movieData = {
            name,
            duration,
            year,
            description: description || '',
            director: director || '',
            cast,
            categories,
            mainImage: mainImage || '',   
            trailer: trailer || ''  
        };  

        // Pass files if they exist, otherwise pass undefined
        const newMovie = await movieService.createMovie(movieData, req.files || undefined);
        return res.status(201).json(newMovie);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const createMovieFromScript = async (req, res) => {
    try {
        // Parse fields from request body
        const { name, duration, year, description, director, mainImage, trailer, movieFile } = req.body;

        // Validate required fields
        if (!name || !duration || !year) {
            return res.status(400).json({ error: "Name, duration and year are required" });
        }
        
        // Parse cast from JSON string
        let cast = [];
        try {
            cast = req.body.cast ? JSON.parse(req.body.cast) : [];
        } catch (e) {
            return res.status(400).json({ error: "Invalid cast format" });
        }

        // Parse categories from JSON string
        let categories = [];
        try {
            categories = req.body.categories ? JSON.parse(req.body.categories) : [];
        } catch (e) {
            return res.status(400).json({ error: "Invalid categories format" });
        }

        const movieData = {
            name,
            duration,
            year,
            description: description || '',
            director: director || '',
            cast,
            categories,
            mainImage: mainImage || '',   
            trailer: trailer || '',
            movieFile: movieFile || ''
        };  

        // Call service without files parameter
        const newMovie = await movieService.createMovieFromScript(movieData);
        return res.status(201).json(newMovie);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const getMovie = async (req, res) => {
    const { id } = req.params; 

    // Check movie Id is valid in mongoDB formula
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid movie ID" });
    }
    
    try {
        const movie = await movieService.getMovieById(id);
        // Check movie exists 
        if (!movie){
            return res.status(404).json({ error: "Movie not found" });
        }
        
        return res.json(movie); 

    }   catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const updateMovie = async (req, res) => {
    const { id } = req.params;

    try {
        // Check required fields from form data
        const name = req.body.name;
        const duration = req.body.duration;
        const year = req.body.year;

        // In a PUT request, all required fields must be present
        if (!name || !duration || !year) {
            return res.status(400).json({ error: "All fields must be updated - name, duration, year" });
        }

        // Parse cast from JSON string
        let cast = [];
        try {
            cast = req.body.cast ? JSON.parse(req.body.cast) : [];
        } catch (e) {
            return res.status(400).json({ error: "Invalid cast format" });
        }

        // Parse categories from JSON string
        let categories = [];
        try {
            categories = req.body.categories ? JSON.parse(req.body.categories) : [];
        } catch (e) {
            return res.status(400).json({ error: "Invalid categories format" });
        }

        const movieData = {
            name,
            duration,
            year,
            description: req.body.description || '',
            director: req.body.director || '',
            cast,
            categories
        };

        const updatedMovie = await movieService.updateMovie(movieData, id, req.files);
        return res.status(200).json(updatedMovie);
    } catch (error) {
        console.error('Update movie error:', error);
        return res.status(400).json({ error: error.message });
    }
};

const deleteMovie = async (req, res) => {
    const { id } = req.params;

    // Check movie Id is valid in mongoDB formula
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid movie ID" }); 
    }    

    try {
        // Delete the movie and delete it from all categories that has it 
        const deletedMovie = await movieService.deleteMovie(id); 
        // Check for succsessfull deletion 
        if(!deletedMovie) {
            return res.status(400).json({ error: "Movie not found" });
        } 
    } catch (error) {
          return res.status(400).json({ message: error.message });
    }

    return res.status(204).end(); 
};

// Get all promoted categories with movies that the user hasn't watched + 20 latest movies he watched (all in random order)
const getMoviesList = async (req, res) => {
    const userId = req.userId;
    // Checks userId is given 
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });;
    }

    try {
        const moviesByCategory = await movieService.getMoviesList(userId);
        return res.json(moviesByCategory);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Search movies by a query of the fields 
const searchMovies = async (req, res) => {
    try {
        const { query } = req.params; 

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // Search movies if or one of their fields has the string in it 
        const movies = await movieService.searchMovies(query);

        if (!movies || movies.length === 0) {
            return res.status(404).json({ message: "No movies found matching the query" }); 
        }

        res.status(200).json({ movies }); 

    } catch (error) {
        res.status(500).json({ message: "error" });
    }
};

module.exports = { createMovie, getMovie, updateMovie, deleteMovie, getMoviesList ,searchMovies, createMovieFromScript };