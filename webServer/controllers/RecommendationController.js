const recommendationService = require('../services/RecommendationService');
const MovieServices = require('../services/MovieService');
const UserServices = require('../services/UserServices');

const getRecommendations = async (req, res) => {
    try {
        const userId = req.userId; 
        const movieId = req.params.id; 

        if (!movieId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Get recommendations From the C++ Server 
        const result = await recommendationService.sendCommand(userId, movieId, 'GET');

        // If the result is successful, get the movies details and return them
        if (result && result.status === 'success') {
            // return value - the movies from the reccomendation system
            const moviesDetails = [];
            // For each recommendation, get the movie details (bring them back to their current NodeJs state)
            for (const rec of result.recommendations) {
                const movie = await MovieServices.getMovieByCustomId(rec.movieId); 
                moviesDetails.push(movie);
            }
            // Return the movie details
            return res.status(200).json({ movies: moviesDetails });
        }
    } catch (error) {
        if (error.message === 'Movie or user not found') {
            return res.status(404).json({ error: 'Movie or user not found' });
        }
        if (error.message === 'Recommendation service unavailable') {
            return res.status(503).json({ error: 'Recommendation service unavailable' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Add a movie to the user's recommendations (and watch history)
const AddMovieToRecommendations = async (req, res) => {
    try {
        const userId = req.userId;
        const movieId = req.params.id;
        
        if (!movieId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        //updating the user's movieWatchHistory and recommendations through the user service
        result = await UserServices.updateUser(userId, null, null, null, null, null, [{movieId}]);
        if (result) {
            return res.status(204).send();
        }
        
        // Return error if recommendation service didnt send a response back
        return res.status(500).json({ error: 'Invalid response from recommendation service' });
    } catch (error) {
        if (error.message === 'Movie or user not found') {
            return res.status(404).json({ error: 'Movie or user not found' });
        }
        if (error.message === 'Recommendation service unavailable') {
            return res.status(503).json({ error: 'Recommendation service unavailable' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};
module.exports = { getRecommendations , AddMovieToRecommendations };