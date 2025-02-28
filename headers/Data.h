#ifndef DATA_H
#define DATA_H

#include "User.h"  
#include "Movie.h"
#include <mutex>
#include <vector>
#include <string> 
#include <algorithm> 
#include <iostream>

class Data {
private:
    std::vector<User> users;   
    std::vector<Movie> movies;  
    mutable std::mutex dataMutex; // Mutex to protect the data - mutable because it is modified in const methods
    Data() {}                  

public:
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

    // Retrieve all users
    const std::vector<User>& getUsers() const;

    // Retrieve all movies
    const std::vector<Movie>& getMovies() const;

    // Find a user by ID
    User* findUserById(const std::string& userId);

    // Find a movie by ID
    Movie* findMovieById(const std::string& movieId);

    // Method to clear all data
    void clear();
};

#endif  