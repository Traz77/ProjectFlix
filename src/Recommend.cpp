#include "Recommend.h"

// Calculates movie recommendations for a given user based on another reference movie
void Recommend::execute(std::vector<std::string> args, std::ostream& response) {
    if (args.size() != 2) {
        return;
    }

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

    
    // Step 1: Calculate the table of common movies
    std::vector<std::pair<User, int>> table = calculateCommonMovies(interestedUser, movieToRecBy);

    // Step 2: Calculate total relevance for all movies
    std::unordered_map<std::string, int> movieRelevance = calculateTotalRelevance(interestedUser, movieToRecBy, table);

    // Step 3: Sort and print the sorted movie relevance
    printSortedMovieRelevance(movieRelevance, response);
}

// Calculate common movies and populate the table
std::vector<std::pair<User, int>> Recommend::calculateCommonMovies(User* interestedUser, Movie* movieToRecBy) {
    std::vector<std::pair<User, int>> table; // Stores other users and their common movie count
    std::vector<User> allUsers = data->getUsers();
    const std::vector<Movie>& interestedMovies = interestedUser->getMoviesWatched();

    // Iterate through all users
    for (const User& otherUser : allUsers) {
       
        // Skip the current user and check if the user has watched `movieToRecBy`
        if (otherUser.getUserID() != interestedUser->getUserID() && otherUser.isWatched(*movieToRecBy)) {
            const std::vector<Movie>& otherMovies = otherUser.getMoviesWatched();
            
            // Calculate the count of common movies between `interestedUser` and `otherUser`
            int commonCount = calculateCommonCount(interestedMovies, otherMovies);

            // Add the result to the table
            table.emplace_back(otherUser, commonCount);
        }
    }

    return table; // Return the populated table
}

// Helper method to calculate the number of common movies between two lists
int Recommend::calculateCommonCount(const std::vector<Movie>& movies1, const std::vector<Movie>& movies2) {
    int commonCount = 0;

    // Compare each movie in the two lists
    for (const Movie& movie1 : movies1) {
        for (const Movie& movie2 : movies2) {
            if (movie1 == movie2) {
                ++commonCount; // Increment the counter if a common movie is found
            }
        }
    }

    return commonCount; // Return the count
}

// Print the common movies table (for debugging purposes)
void Recommend::printCommonMoviesTable(User* interestedUser, const std::vector<std::pair<User, int>>& table) {

    // Print each user and their common movie count
    for (const auto& entry : table) {
        std::cout << entry.first.getUserID() << "\t" << entry.second << std::endl;
    }
}

// Calculate total relevance for each movie based on the common movie table
std::unordered_map<std::string, int> Recommend::calculateTotalRelevance(User* interestedUser, Movie* movieToRecBy, const std::vector<std::pair<User, int>>& table) {
    std::unordered_map<std::string, int> movieRelevance;

    // Iterate through the common movies table
    for (const auto& entry : table) {
        const User& otherUser = entry.first;
        int weight = entry.second; // Weight is the common movie count
        const std::vector<Movie>& otherMovies = otherUser.getMoviesWatched();

        // Ensure that the user has watched the reference movie
        if (std::find(otherMovies.begin(), otherMovies.end(), *movieToRecBy) != otherMovies.end()) {
            for (const Movie& movie : otherMovies) {
                // Ignore the reference movie and ensure `interestedUser` hasn't watched it
                if (movie.getMovieId() != movieToRecBy->getMovieId() && !interestedUser->isWatched(movie)) {
                    movieRelevance[movie.getMovieId()] += weight; // Add the weight to the movie's relevance
                }
            }
        }
    }
    return movieRelevance; // Return the movie relevance map
}

void Recommend::printSortedMovieRelevance(const std::unordered_map<std::string, int>& movieRelevance, std::ostream& response) {
    // Convert the unordered_map to a vector of pairs for sorting
    std::vector<std::pair<std::string, int>> sortedVector;
    for (const auto& item : movieRelevance) {
        if (item.second > 0) {
            sortedVector.push_back(item);
        }
    }

    // Sort the vector by weight (descending) and by movie ID (ascending) if weights are equal
    std::sort(sortedVector.begin(), sortedVector.end(), [](const auto& a, const auto& b) {
        if (a.second != b.second) {
            return a.second > b.second; // Sort by weight in descending order
        }
        // Convert string IDs to integers for proper numerical comparison
        return std::stoi(a.first) < std::stoi(b.first); // If weights are equal, sort by movie ID numerically
    });

    // Output only the top 10 recommendations
    const size_t maxRecommendations = 10;
    for (size_t i = 0; i < std::min(maxRecommendations, sortedVector.size()); ++i) {
        response << sortedVector[i].first;
        if (i != std::min(maxRecommendations, sortedVector.size()) - 1) {
            response << " ";
        }
    }
    if (!sortedVector.empty()) {
        response << "\n";
    }
}





