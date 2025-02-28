const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Category = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    promoted: {
        type: Boolean,
        required: true
    },

    // Every category holds a movie's array, of the movies that are part of the category
    movies: {
        type: [{
        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movie"
        },
        movieName: {
            type: String
        }   
    }],
    default: []
    },
});

// Define the returned Json format 
Category.method("toJSON", function () {
    const category = this.toObject();
    
    // Get all movies the category holds 
    const movies = category.movies.map(movie => movie.movieId.name);
  
    return {
        _id: category._id,
        name: category.name,
        promoted: category.promoted,
        movies: movies,
    };
});

module.exports = mongoose.model("Category", Category);