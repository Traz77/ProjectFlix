#include "Delete.h"

// Constructor
Delete::Delete() {
    this->fileStream = new FileStream();
}

// Constructor with different filestream for tests only 
Delete::Delete(IStreamable* fileStream) {
    this->fileStream = fileStream;
}

void Delete::execute(std::vector<std::string> args, std::ostream& response) {
    // Get the data singelton instance
    Data& data = Data::getInstance();

    // Extract the user ID and find it in Data 
    std::string userId = args[0];
    User* user = data.findUserById(userId);

    // Check command is valid 
    if (checkValidCommand(args) == 0) {
        response << "404 Not Found\n";
        return;
    }

    // Iterate throught all the movies that needs to be removed, and remove them 
    for (int i = 1; i < args.size(); i++) {
        Movie* movie = data.findMovieById(args[i]); 

        movie->removeUserFromList(*user);
        
        user->removeMovieFromList(*movie);
    }

    // Update the movies in file 
    std::vector<Movie> updatedMovies = user->getMoviesWatched();
    fileStream->write(*user);

    // Deletion made succsesfully 
    response << "204 No Content\n";
}

std::string Delete::toString () const {
    return "DELETE, arguments: [userid] [movieid1] [movieid2] ...";
}

// Checks that the movie that the user wants to delete is actually in the user's watched list 
int Delete::checkValidCommand(std::vector<std::string> args) {
    // Get the data instance 
    Data& data = Data::getInstance();

    std::string userId = args[0];
    User* user = data.findUserById(userId);

    // User does not exist 
    if (user == nullptr) {
        return 0;
    }

    // Check that the user watched every movie given 
    for (int i = 1; i < args.size(); i++) {
        Movie* movie = data.findMovieById(args[i]);
        if (movie == nullptr) {
            return 0;
        }
        int flag = 0; // user not found 
        for (int j = 0; j < movie->getUsersWatched().size(); j++) {
            if (movie->getUsersWatched()[j] == *user) {
                flag = 1; // user found
            }
        }
        if (!flag) {
            return 0;
        }
    }
    return 1;
}