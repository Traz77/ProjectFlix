const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Movie = new Schema({
    name: {
        type: String,
        required: true
    },
    id: {
        type: Number, 
        unique: true 
    }, 
    duration: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default:''
    },
    director: {
        type: String, 
        default:''
    },
    cast: {
        type: [String], 
        default: [],   
      },
    mainImage: {
        type: String,
        default: ''
    },
    images: {
        type: [String],
        default: []
    },
    trailer: {
        type: String,
        default: ''
    },
    movieFile: {
        type: String,
        default: ''
    },
    // Every movie holds a categories array, of the categories that the movie is a part of 
    categories:{
    type: [{
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        },
        categoryName: {
            type: String
        }
    }],
    default: []
    },
});

// Define the returned Json format 
Movie.method("toJSON", function () {
    const movie = this.toObject();
    
    // Get all categories the movie holds 
    const categories = movie.categories.map(category => category.categoryId.name); 
    
    return {
        _id: movie._id,
        name: movie.name,
        duration: movie.duration,
        year: movie.year,
        description: movie.description,
        director: movie.director,
        cast: movie.cast,
        mainImage: movie.mainImage,
        images: movie.images,
        trailer: movie.trailer,
        movieFile: movie.movieFile,
        categories: categories,  
    };
});
  
module.exports = mongoose.model("Movie", Movie);