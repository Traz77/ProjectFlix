#ifndef MOVIE_H
#define MOVIE_H

#include "User.h"

#include <vector>
#include <string>
#include <stdexcept>  
#include <iostream>
#include <algorithm>

class User;

class Movie {
private:
    std::string movieId;
    // List of users who watched the movie            
    std::vector<User> usersWatched;  

public:
    // Constructor
    Movie(const std::string& id, const std::vector<User>& usersWatched);

    void removeUserFromList(User&);

    std::vector<User>& getUsersWatchedMutable();

    // Getter for movieId
    const std::string& getMovieId() const;

    // Getter for usersWatched
    const std::vector<User>& getUsersWatched() const;

    // Setter for usersWatched
    void setUsersWatched( const std::vector<User>& newUsersWatched);

    // Add a user to the list of users who watched the movie 
    void addUser (User& newUser);

     // Overload == operator
    bool operator==(const Movie& other) const;
};

#endif
