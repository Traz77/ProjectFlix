#ifndef RECOMMEND_H
#define RECOMMEND_H

#include "User.h"
#include "Movie.h"
#include "Data.h"
#include "ICommand.h"
#include "IServer.h"

#include <vector>
#include <unordered_map>
#include <string>
#include <iostream>
#include <sstream>
#include <algorithm>

class Recommend : public ICommand {
private:
    Data* data; 

    // Helper method to calculate the common movies between the interested user and others
    std::vector<std::pair<User, int>> calculateCommonMovies(User* interestedUser, Movie* movieToRecBy);

    // Helper method to calculate the number of common movies between two lists of movies
    int calculateCommonCount(const std::vector<Movie>& movies1, const std::vector<Movie>& movies2);

    // Helper method to calculate the total relevance for each movie
    std::unordered_map<std::string, int> calculateTotalRelevance(User* interestedUser, Movie* movieToRecBy, const std::vector<std::pair<User, int>>& table);

    // Helper method to print the table of common movies
    void printCommonMoviesTable(User* interestedUser, const std::vector<std::pair<User, int>>& table);

    // Helper method to print the sorted movie relevance
    void printSortedMovieRelevance(const std::unordered_map<std::string, int>& movieRelevance,  std::ostream& response);

public:
    Recommend() : data(&Data::getInstance()) {}

    // Calculates movie recommendations for a given user based on another reference movie.
    void execute(std::vector<std::string> args, std::ostream& response) override;
};

#endif