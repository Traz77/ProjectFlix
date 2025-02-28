#ifndef USER_H
#define USER_H

#include <vector>
#include <string>
#include "Movie.h" 
#include <iostream>
#include <algorithm> 

class Movie; 

class User {
private:
    std::string userID;                
    std::vector<Movie> moviesWatched;  

public:
    // Constructor
    User(const std::string& userID, const std::vector<Movie>& moviesWatched);

    // Get a movies watched list that isn't const 
    std::vector<Movie>& getMoviesWatchedMutable();

    // Remove a movie from the movies watched list of a user 
    void removeMovieFromList(Movie&);

    // Getter for userID
    const std::string& getUserID() const;

    // Getter for moviesWatched
    const std::vector<Movie>& getMoviesWatched() const;

    // Setter for moviesWatched
    void setMoviesWatched( const std::vector<Movie>& newMoviesWatched);

    // Add movie to watch
    void addMovie (Movie& newMovie);

    // Operator overloading for ==
    bool operator==(const User& other) const;

    // Operator overloading for !=
    bool operator!=(const User& other) const;

    // Returns if a movie is watched by the user
    bool isWatched(const Movie& movie) const ;
};

#endif