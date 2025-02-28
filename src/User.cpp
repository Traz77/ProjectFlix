#include "User.h"

// Constructor
User::User(const std::string& userID, const std::vector<Movie>& moviesWatched)
: userID(userID), moviesWatched(moviesWatched) {}

// Getter for userID
const std::string& User::getUserID() const {
    return userID;
}

// Return a non consts vector of the movies watched by the user 
std::vector<Movie>& User::getMoviesWatchedMutable() {
    return moviesWatched;
}

// Deleting given movies from the user's watch list
void User::removeMovieFromList(Movie& movieToDelete) {
    // Get the movies watched 
    std::vector<Movie>& movies = getMoviesWatchedMutable();
    // Find the movies and delte them 
    for (int i = 0; i < movies.size(); i++) {
        if (movies[i] == movieToDelete) {
            movies.erase(movies.begin() + i);
            break;
        }
    }
}

// Getter for moviesWatched
const std::vector<Movie>& User::getMoviesWatched() const {
    return moviesWatched;
}

// Setter for moviesWatched
void User::setMoviesWatched( const std::vector<Movie>& newMoviesWatched) {
    moviesWatched = newMoviesWatched;
}

// Add movie to watch
void User::addMovie (Movie& newMovie){
    if (std::find(moviesWatched.begin(),moviesWatched.end(), newMovie) == moviesWatched.end()){
        moviesWatched.push_back(newMovie);
    } 
}
        
// Overloading the == operator
bool User::operator==(const User& other) const {
   return userID == other.userID ;
}

bool User::operator!=(const User& other) const {
    return !(*this == other); // Use the already implemented operator==
}

bool User::isWatched(const Movie& movie) const {
// Check if the movie exists in the user's watched movies
    if (std::find(moviesWatched.begin(), moviesWatched.end(), movie) == moviesWatched.end()) {
        return false; // Movie not found
    }
    return true; // Movie found
};



    

     
