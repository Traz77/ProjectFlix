#include "Filestream.h"
#include <unordered_map>

static std::mutex g_fileMutex;
static std::ofstream g_savedFile;
static std::string g_filename;

namespace {
void ensure_open_stream_for_file(const std::string& targetFilename) {
    bool fileVisible = false;
    {
        std::ifstream probe(targetFilename);
        fileVisible = probe.good();
    }

    if (g_savedFile.is_open() && (g_filename != targetFilename || !fileVisible)) {
        g_savedFile.flush();
        g_savedFile.close();
    }

    if (!g_savedFile.is_open()) {
        g_filename = targetFilename;
        g_savedFile.open(g_filename, std::ios::app);
    }
}
}

FileStream::FileStream(const std::string& file) : filename(file) {
    std::lock_guard<std::mutex> lock(g_fileMutex);
    ensure_open_stream_for_file(filename);
}

std::vector<User> FileStream::read_impl() {
    std::ifstream inside(filename);
    if (!inside) {
        return {};
    }
    std::vector<User> allUsers;
    std::string line;
    auto readCleanLine = [&inside, &line]() -> bool {
        if (!std::getline(inside, line)) return false;
        if (!line.empty() && line.back() == '\r') line.pop_back();
        return true;
    };
    
    while(readCleanLine()) {
        if (line.empty() || line.find_first_not_of(" \t\n") == std::string::npos) continue;
        std::string userId = line;
        if (!readCleanLine()) break;
        int numOfMoviesToRead = 0;
        try { numOfMoviesToRead = std::stoi(line); } catch(...) { break; }
        std::vector<Movie> movies;
        for (int i = 0; i < numOfMoviesToRead; i++) {
            if (!readCleanLine()) break;
            if (line.empty() || line.find_first_not_of(" \t\n") == std::string::npos) continue;
            movies.push_back(Movie(line, {}));
        }
        allUsers.push_back(User(userId, movies));
    }
    // Keep first-seen user order but retain only the latest snapshot per user.
    std::vector<User> latestUsers;
    latestUsers.reserve(allUsers.size());
    std::unordered_map<std::string, std::size_t> userIndex;

    for (const User& user : allUsers) {
        auto it = userIndex.find(user.getUserID());
        if (it == userIndex.end()) {
            userIndex[user.getUserID()] = latestUsers.size();
            latestUsers.push_back(user);
        } else {
            latestUsers[it->second] = user;
        }
    }

    return latestUsers;
}

void FileStream::updateMovies_impl(const User& updatedUserWithUpdatedMovies, std::vector<Movie> updatedMovies) {
    if (g_savedFile.is_open()) {
        g_savedFile << updatedUserWithUpdatedMovies.getUserID() << "\n"
                    << updatedMovies.size() << "\n";
        for (const Movie& movie : updatedMovies) {
            g_savedFile << movie.getMovieId() << "\n";
        }
    }
}

void FileStream::write(const User& user) { 
    std::lock_guard<std::mutex> lock(g_fileMutex);
    ensure_open_stream_for_file(filename);
    updateMovies_impl(user, user.getMoviesWatched());
}

std::vector<User> FileStream::read() {
    std::lock_guard<std::mutex> lock(g_fileMutex);
    ensure_open_stream_for_file(filename);
    if (g_savedFile.is_open()) g_savedFile.flush();
    return read_impl();
}

void FileStream::updateMovies(const User& updatedUserWithUpdatedMovies, std::vector<Movie> updatedMovies) {
    std::lock_guard<std::mutex> lock(g_fileMutex);
    ensure_open_stream_for_file(filename);
    updateMovies_impl(updatedUserWithUpdatedMovies, updatedMovies);
}

void FileStream::initiate() { 
    std::lock_guard<std::mutex> lock(g_fileMutex);
    ensure_open_stream_for_file(filename);
    if (g_savedFile.is_open()) g_savedFile.flush();

    std::vector<User> usersFromFile = read_impl();

    Data& data = Data::getInstance();

    for (const User& savedUser : usersFromFile) {
        const std::string& userId = savedUser.getUserID();
        User* user = data.findUserById(userId);
        if (!user) {
            data.addUser(User(userId, {}));
            user = data.findUserById(userId);
        }

        for (const Movie& m : savedUser.getMoviesWatched()) {
            Movie* movie = data.findMovieById(m.getMovieId());
            if (!movie) {
                data.addMovie(Movie(m.getMovieId(), {}));
                movie = data.findMovieById(m.getMovieId());
            }
            user->addMovie(*movie);
            movie->addUser(*user);
        }
    }   
}
