#include "Data.h"

// Get the singleton instance
Data& Data::getInstance() {
    static Data instance;
    return instance;
}

// Method to clear all data
void Data::clear() {
    std::unique_lock<std::shared_timed_mutex> lock(dataMutex);
    movies.clear();
    users.clear();
    userMap.clear();
    movieMap.clear();
}

// Add a user
void Data::addUser(const User& user) {
    if (userMap.find(user.getUserID()) == userMap.end()) {
        users.push_back(user);
        userMap[user.getUserID()] = &users.back();
    }
}

// Add a movie
void Data::addMovie(const Movie& movie) {
    if (movieMap.find(movie.getMovieId()) == movieMap.end()) {
        movies.push_back(movie);
        movieMap[movie.getMovieId()] = &movies.back();
    } 
}

// Retrieve all users - returns COPY for thread safety
std::vector<User> Data::getUsers() const {
    std::shared_lock<std::shared_timed_mutex> lock(dataMutex);
    return std::vector<User>(users.begin(), users.end());  // Copy made while lock held
}

// Retrieve all movies - returns COPY for thread safety
std::vector<Movie> Data::getMovies() const {
    std::shared_lock<std::shared_timed_mutex> lock(dataMutex);
    return std::vector<Movie>(movies.begin(), movies.end());  // Copy made while lock held
}

// Find a user by ID
User* Data::findUserById(const std::string& userId) {
    auto it = userMap.find(userId);
    return it != userMap.end() ? it->second : nullptr;
}

// Find a movie by ID
Movie* Data::findMovieById(const std::string& movieId) {
    auto it = movieMap.find(movieId);
    return it != movieMap.end() ? it->second : nullptr;
};
