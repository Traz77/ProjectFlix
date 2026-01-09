#include "Filestream.h"

FileStream::FileStream(const std::string& file = "SaveData") : filename(file) {}

// Internal read implementation (no lock)
std::vector<User> FileStream::read_impl() {
    std::ifstream inside(filename);
    if (!inside) {
        return {};
    }
    std::vector<User> allUsers;
    std::string line;
    while(std::getline(inside, line)) {
        // Skip empty lines or lines with only whitespace
        if (line.empty() || line.find_first_not_of(" \t\n\r") == std::string::npos) {
            continue;
        }
        std::string userId = line;
        std::getline(inside, line);
        int numOfMoviesToRead = std::stoi(line);
        std::vector<Movie> movies;
        for (int i = 0; i < numOfMoviesToRead; i++) {
            std::getline(inside, line);
            std::string movieId = line;
            movies.push_back(Movie(movieId, {}));
        }
        allUsers.push_back(User(userId, movies));
    }
    return allUsers;
}

// Internal update implementation (no lock)
void FileStream::updateMovies_impl(const User& updatedUserWithUpdatedMovies, std::vector<Movie> updatedMovies) {
    std::vector<User> exportUsers = read_impl();
    
    std::ofstream saved(filename, std::ios::trunc);
    
    for (std::vector<User>::size_type i = 0; i < exportUsers.size(); i++) {
        if (updatedUserWithUpdatedMovies.getUserID() == exportUsers[i].getUserID()) {
            saved << updatedUserWithUpdatedMovies.getUserID() << "\n";
            saved << updatedMovies.size() << "\n";
            for (std::vector<Movie>::size_type j = 0; j < updatedMovies.size(); j++) {
                saved << updatedMovies[j].getMovieId() << "\n";
            }
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

void FileStream::write(const User& user) { 
    std::unique_lock<std::shared_timed_mutex> lock(fileMutex);
    std::vector<User> existingUsers = read_impl();
    for (const User& existingUser : existingUsers) {
        if (existingUser.getUserID() == user.getUserID()) {
            updateMovies_impl(user, user.getMoviesWatched());
            return;
        }
    }
    std::ofstream saved (filename, std::ios::app);
    saved << user.getUserID() << "\n";
    const std::vector<Movie>& userMovie = user.getMoviesWatched();
    saved << userMovie.size() << "\n";
    for (std::vector<Movie>::size_type i = 0; i < userMovie.size(); i++) {
        saved << userMovie[i].getMovieId() << "\n";
    }
    saved.close();
}

std::vector<User> FileStream::read() {
    std::shared_lock<std::shared_timed_mutex> lock(fileMutex);
    return read_impl();
}

void FileStream::updateMovies(const User& updatedUserWithUpdatedMovies, std::vector<Movie> updatedMovies) {
    std::unique_lock<std::shared_timed_mutex> lock(fileMutex);
    updateMovies_impl(updatedUserWithUpdatedMovies, updatedMovies);
}

void FileStream::initiate() { 
    std::unique_lock<std::shared_timed_mutex> lock(fileMutex);
    std::vector<User> usersFromFile = read_impl();
    for (const User& user : usersFromFile) {
        bool userExists = false;
        Data& data = Data::getInstance();
        User* existingUser = data.findUserById(user.getUserID());
        if (existingUser != nullptr) {
            userExists = true;
        }
        if (!userExists) {
            std::vector<std::string> userCommand = {user.getUserID()}; 
            const std::vector<Movie>& userMovies = user.getMoviesWatched();
            for (const Movie& movie : userMovies) {
                userCommand.push_back(movie.getMovieId()); 
            }
            Add addCommand;
            std::stringstream response;
            addCommand.execute(userCommand, response);
        }
    }   
}




            