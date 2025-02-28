#include "Movie.h"

// Constructor that validates the movie ID
Movie::Movie(const std::string& id, const std::vector<User>& usersWatched)
    : movieId(""), usersWatched(usersWatched) {
        bool valid = true; 
        for (char ch : id) {
            if (!std::isdigit(ch)) {
                valid = false;
                break;
            }
        }
    if (valid) {
        movieId = id;
    }
}

// Remove the user from the list of users who watched the movie 
void Movie::removeUserFromList(User& userToDelete) {
    // Find the user and remove it 
    std::vector<User>& users = getUsersWatchedMutable();
    for (int i = 0; users.size(); i++) {
        if (users[i] == userToDelete) {
            users.erase(users.begin() + i);
            break;
        }
    }
}

// Get a non const userWatched list 
std::vector<User>& Movie::getUsersWatchedMutable() {
    return usersWatched;
}

// Getter for movieId
const std::string& Movie::getMovieId() const {
    return movieId;
}

// Getter for usersWatched
const std::vector<User>& Movie::getUsersWatched() const {
    return usersWatched;
}

// Setter for moviesWatched
void Movie::setUsersWatched ( const std::vector<User>& newUsersWatched) {
    usersWatched = newUsersWatched;
}

// Add user watching
void Movie::addUser (User& newUser){
    if (std::find(usersWatched.begin(),usersWatched.end(), newUser) == usersWatched.end()){
        usersWatched.push_back(newUser);
    }   
}

// Overloading the == operator
bool Movie::operator==(const Movie& other) const {
    return movieId == other.movieId;
}







