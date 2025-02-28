#include "Filestream.h"

FileStream::FileStream(const std::string& file = "SaveData") : filename(file) {}

void FileStream::write(const User& user) { 
    std::lock_guard<std::mutex> lock(fileMutex);
    // Create the file 
    std::ofstream saved (filename, std::ios::app);
    // Open file to read
    std::ifstream dataFile(filename);
    std::vector<User> existingUsers = read();
    for (const User& existingUser : existingUsers) {
        if (existingUser.getUserID() == user.getUserID()) {
            // update its movies with the new ones
            updateMovies(user, user.getMoviesWatched());
            return;
        }
    }
    // Save the user name to file and endline 
    saved << user.getUserID() << "\n";
    // Save the corresponding user movies to the file
    const std::vector<Movie>& userMovie = user.getMoviesWatched();

    // First, save the size so we can pull it later 
    saved << userMovie.size() << "\n";
    for (std::vector<Movie>::size_type i = 0; i < userMovie.size(); i++) {
        saved << userMovie[i].getMovieId() << "\n";
    }
    saved.close();
}

//read method return an array of users 
std::vector<User> FileStream::read() {
    std::ifstream inside(filename);
    // if nothing inside - just return 
    if (!inside) {
        return {};
    }
    std::vector<User> allUsers;
    std::string line;
    // reads a line until \n and put it in line 
    while(std::getline(inside, line)) {
        //first line is the userId
        std::string userId = line;
        // we want to fetch the number of movies we wrote in write method. 
        std::getline(inside, line);
        int numOfMoviesToRead = std::stoi(line);
        std::vector<Movie> movies;
        for (int i = 0; i < numOfMoviesToRead; i++) {
            std::getline(inside, line);
            std::string movieId = line;
            movies.push_back(Movie(movieId, {}));
        }
        // this is for the tests to check items are read as they should. 
        allUsers.push_back(User(userId, movies));
    }
    return allUsers;
}

void FileStream::updateMovies(const User& updatedUserWithUpdatedMovies, std::vector<Movie> updatedMovies) {
    std::vector<User> exportUsers = read();
    
    // make sure we dont duplicate data
    std::ofstream saved(filename, std::ios::trunc);
    
    // finding the user that needs updating. 
    for (std::vector<User>::size_type i = 0; i < exportUsers.size(); i++) {
        if (updatedUserWithUpdatedMovies.getUserID() == exportUsers[i].getUserID()) {
            // writing the user with the updated data
            saved << updatedUserWithUpdatedMovies.getUserID() << "\n";
            saved << updatedMovies.size() << "\n";
            // writing all the movies including whats updated 
            for (std::vector<Movie>::size_type j = 0; j < updatedMovies.size(); j++) {
                saved << updatedMovies[j].getMovieId() << "\n";
            }
            // write the other users without changes
        } else {
            saved << exportUsers[i].getUserID() << "\n";
            const std::vector<Movie>& userMovies = exportUsers[i].getMoviesWatched();
            saved << userMovies.size() << "\n";
            for (const Movie& movie : userMovies) {
                saved << movie.getMovieId() << "\n";
            }
        }
    }
    saved.close();
}

// Initiate is invoked only if the program crash and we want to restore all data.
void FileStream::initiate() { 
    std::lock_guard<std::mutex> lock(fileMutex);
    // Read all users
    std::vector<User> usersFromFile = read();
    for (const User& user : usersFromFile) {
    // Check if the user already exists in memory
        bool userExists = false;
        Data& data = Data::getInstance();
        User* existingUser = data.findUserById(user.getUserID());
        if (existingUser != nullptr) {
            userExists = true;
        }
        // if the user exists, dont add it
        if (!userExists) {
            // Use the Add command to add the user to memory - without writing to the file as the file already contains all users
            std::vector<std::string> userCommand = {user.getUserID()}; 
            // Add their movie list to the userCommand
            const std::vector<Movie>& userMovies = user.getMoviesWatched();
            for (const Movie& movie : userMovies) {
                userCommand.push_back(movie.getMovieId()); // Add movie ID to the command
            }
            // Execute the Add command to add the user
            Add addCommand;
            std::stringstream response;
            addCommand.execute(userCommand, response);
        }
    }   
}




            