#ifndef DATA_H
#define DATA_H

#include "User.h"  
#include "Movie.h"
#include <shared_mutex>
#include <mutex>
#include <vector>
#include <string> 
#include <algorithm> 
#include <list>
#include <unordered_map>

class Data {
private:
    std::list<User> users;
    std::list<Movie> movies;
    std::unordered_map<std::string, User*> userMap;
    std::unordered_map<std::string, Movie*> movieMap;
    mutable std::shared_timed_mutex dataMutex; // Mutex to protect the data
    std::recursive_mutex opsMutex;
    Data() {}

public:
    std::recursive_mutex& getOpsMutex() { return opsMutex; }
    // Get the singelton instance
    static Data& getInstance();

    // Delete copy and move constructors
    Data(Data const&) = delete;
    Data& operator=(Data const&) = delete;
    Data(Data&&) = delete;
    Data& operator=(Data&&) = delete;

    
    // Add a user
    void addUser(const User& user);

    // Add a movie
    void addMovie(const Movie& movie);

    // Retrieve all users (returns copy for thread safety)
    std::vector<User> getUsers() const;
    const std::list<User>& getUsersRef() const { return users; }
    std::shared_timed_mutex& getMutex() const { return dataMutex; }

    // Retrieve all movies (returns copy for thread safety)
    std::vector<Movie> getMovies() const;

    // Find a user by ID
    User* findUserById(const std::string& userId);

    // Find a movie by ID
    Movie* findMovieById(const std::string& movieId);

    // Method to clear all data
    void clear();
};

#endif  