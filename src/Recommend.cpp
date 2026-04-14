#include "Recommend.h"
#include <unordered_set>
#include <algorithm>
#include <string>

// Calculates movie recommendations for a given user based on another reference movie
void Recommend::execute(std::vector<std::string> args, std::ostream& response) {
    if (args.size() != 2) {
        return;
    }

    std::lock_guard<std::recursive_mutex> lock(data->getOpsMutex());
    
    // Find the interested user by ID
    User* interestedUser = data->findUserById(args[0]);
    if (interestedUser == nullptr) {
        return;
    }

    // Find the movie to recommend by ID
    Movie* movieToRecBy = data->findMovieById(args[1]);
    if (movieToRecBy == nullptr) {
        return;
    }

    // Pre-hash the interested movies for O(1) commonCount checks!
    std::unordered_set<std::string> interestedMovieIds;
    for (const Movie& mov : interestedUser->getMoviesWatched()) {
        interestedMovieIds.insert(mov.getMovieId());
    }

    std::vector<std::pair<const User*, int>> table;
    const std::list<User>& allUsers = data->getUsersRef();

    for (const User& otherUser : allUsers) {
        if (otherUser.getUserID() != interestedUser->getUserID() && otherUser.isWatched(*movieToRecBy)) {
            const std::vector<Movie>& otherMovies = otherUser.getMoviesWatched();
            
            int commonCount = 0;
            for (const Movie& mov : otherMovies) {
                if (interestedMovieIds.find(mov.getMovieId()) != interestedMovieIds.end()) {
                    commonCount++;
                }
            }

            if (commonCount > 0) {
                table.emplace_back(&otherUser, commonCount);
            }
        }
    }

    std::unordered_map<std::string, int> movieRelevance;
    for (const auto& entry : table) {
        const User* otherUser = entry.first;
        int weight = entry.second;
        const std::vector<Movie>& otherMovies = otherUser->getMoviesWatched();

        // Already checked isWatched(*movieToRecBy) earlier, so otherMovies guaranteed contains it
        for (const Movie& movie : otherMovies) {
            const std::string& movieId = movie.getMovieId();
            if (movieId != movieToRecBy->getMovieId() && interestedMovieIds.find(movieId) == interestedMovieIds.end()) {
                movieRelevance[movieId] += weight;
            }
        }
    }

    std::vector<std::pair<std::string, int>> sortedVector(movieRelevance.begin(), movieRelevance.end());
    std::sort(sortedVector.begin(), sortedVector.end(), [](const auto& a, const auto& b) {
        if (a.second != b.second) {
            return a.second > b.second;
        }
        return std::stoi(a.first) < std::stoi(b.first);
    });

    const size_t maxRecommendations = 10;
    for (size_t i = 0; i < std::min(maxRecommendations, sortedVector.size()); ++i) {
        response << sortedVector[i].first;
        if (i != std::min(maxRecommendations, sortedVector.size()) - 1) {       
            response << " ";
        }
    }
    response << "\n";
}
