#include "Add.h"

Add::Add(IStreamable* fileStream){
    this->fileStream = fileStream;
}

Add::Add() {
    this->fileStream = new FileStream();
}

// Method to execute the Add command
void Add::execute(std::vector<std::string> commands, std::ostream& response) {
    // Check if the command is valid
    if (commands.size() == 0 || commands.empty()) {
        return;
    }

    // Extract the movie ID and name from the command
    std::string userId = commands[0]; // user ID is the first argument sent 
    commands.erase(commands.begin()); // pop the user ID

    // Check if the user ID is valid
    if (!isNumber(userId)) {
        return;
    }

    // Find the user in the database - the data object is singleton
    Data& data = Data::getInstance();
    User* user = data.findUserById(userId);


    // If the user is not found, create a new user
    if (user == nullptr) {
        User newUser(userId, std::vector<Movie>());
        // Add the user to the database
        data.addUser(newUser);
        user = data.findUserById(userId);
    }

    // Add the movie to the user's list of watched movies
    for (std::string movieId : commands) {
        // Check if the movie ID is valid
        if (!isNumber(movieId)) {
            return;
        }

        // Find the movie in the database
        Movie* movie = data.findMovieById(movieId);

        // If the movie is not found, create a new movie
        if (movie == nullptr) {
            Movie newMovie (movieId, std::vector<User>());
            data.addMovie(newMovie);
            movie = data.findMovieById(movieId);
        }

        // Add the movie to the user's list of watched movies
        user->addMovie(*movie);
        // Add the user to the movie's list of users
        movie->addUser(*user);
    }
        fileStream->write(*user);
}

// Method to check if a string is a number - validation
bool Add::isNumber(const std::string& str) {
    for (char ch : str) {
        if (!std::isdigit(ch)) {
            return false;
        }
    }
    return true;
}