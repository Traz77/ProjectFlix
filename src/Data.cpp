#include "Data.h"

// Get the singleton instance
Data& Data::getInstance() {
    static Data instance;
    return instance;
}

// Method to clear all data
void Data::clear() {
    std::lock_guard<std::mutex> lock(dataMutex);
    movies.clear();
    users.clear();
}

// Add a user
void Data::addUser(const User& user) {
    std::lock_guard<std::mutex> lock(dataMutex);
    if (std::find(users.begin(), users.end(), user) == users.end()) {
        users.push_back(user);
    }
}

// Add a movie
void Data::addMovie(const Movie& movie) {
    std::lock_guard<std::mutex> lock(dataMutex);
    if (std::find(movies.begin(), movies.end(), movie) == movies.end()) {
        movies.push_back(movie);
    } 
}

// Retrieve all users
const std::vector<User>& Data::getUsers() const {
    std::lock_guard<std::mutex> lock(dataMutex);
    return users;
}

// Retrieve all movies
const std::vector<Movie>& Data::getMovies() const {
    std::lock_guard<std::mutex> lock(dataMutex);
    return movies;
}

// Find a user by ID
User* Data::findUserById(const std::string& userId) {
    std::lock_guard<std::mutex> lock(dataMutex);
    for (auto& user : users) {
        if (user.getUserID() == userId) {
            return &user;
        }
    }
    return nullptr; // User not found
}

// Find a movie by ID
Movie* Data::findMovieById(const std::string& movieId) {
    std::lock_guard<std::mutex> lock(dataMutex);
    for (auto& movie : movies) {
        if (movie.getMovieId() == movieId) {
            return &movie;
        }
    }
    return nullptr; // Movie not found
};
