const express = require('express');
const router = express.Router();
const movieController = require('../controllers/MovieController');
const recommendationController = require('../controllers/RecommendationController');
const { requireAuth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Route to movies 
router.route('/')
    .get(requireAuth, movieController.getMoviesList)
    router.post('/', 
        requireAuth,
        upload.fields([
          { name: 'mainImage', maxCount: 1 },
          { name: 'trailer', maxCount: 1 },
          { name: 'movieFile', maxCount: 1 },
          { name: 'images', maxCount: 5 }
        ]),
        movieController.createMovie
      );

// Route to function of movie by its ID
router.route('/:id')
    .get(movieController.getMovie)
    .put(
        requireAuth,
        upload.fields([
            { name: 'mainImage', maxCount: 1 },
            { name: 'trailer', maxCount: 1 },
            { name: 'movieFile', maxCount: 1 },
            { name: 'images', maxCount: 5 }
        ]),
        movieController.updateMovie
    )
    .delete(requireAuth, movieController.deleteMovie);

// Route to get recommendations by movie ID - recommnedation c++ system
router.route ('/:id/recommend')
    .get(requireAuth, recommendationController.getRecommendations)
    .post(requireAuth, recommendationController.AddMovieToRecommendations);

// Route to get movie by searching a query
router.route ('/search/:query')
    .get(movieController.searchMovies);

module.exports = router;