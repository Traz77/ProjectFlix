const UserModel = require('../models/UserModel');

// A function that gets the last 20 movies watched and retrieve in random order
const getRecentWatchHistory = async (userId) => {
    try {
        // Get the user's watch history
        const user = await UserModel
            .findById(userId)
            // Populate the watchHistory array with the movieId field
            .populate({
                path: 'watchHistory.movieId',
                select: 'name id duration year description director cast mainImage images categories trailer movieFile', // Added trailer and movieFile
                // Populate the categories field of the movieId field
                populate: {
                    path: 'categories.categoryId',
                    select: 'name _id'
                }
            })
            // Get the last 20 entries in the watchHistory array
            .select({ 'watchHistory': { $slice: -20 } });
        
        // If the user is not found, throw an error
        if (!user) {
            throw new Error('User not found');
        }
        
        // Return the watchHistory array randomized
        const watchHistory = [...user.watchHistory];
        for (let i = watchHistory.length - 1; i > 0; i--) {
            // Index to get from the watch history - random
            const j = Math.floor(Math.random() * (i + 1));
            // Swap the movies
            [watchHistory[i], watchHistory[j]] = [watchHistory[j], watchHistory[i]];
        }
        
        return watchHistory;
    } catch (error) {
        console.error('Get recent watch history error:', error);
        throw error;
    }
};

module.exports = { getRecentWatchHistory };