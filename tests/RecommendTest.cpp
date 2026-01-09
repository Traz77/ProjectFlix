#include <gtest/gtest.h>
#include "User.h"
#include "Movie.h"
#include "Data.h"
#include "Recommend.h"
#include <sstream>

// Test the "execute" method with valid input
TEST(RecommendTest, ExecuteWithValidInput) {
    // Access the Data singleton instance
    Data& testData = Data::getInstance();
    testData.clear();
    
    // Create movies
    Movie movie("100", {});
    Movie movie1("101", {});
    Movie movie2("102", {});
    Movie movie3("103", {});
    Movie movie4("104", {});
    Movie movie5("105", {});
    Movie movie6("106", {});
    Movie movie7("107", {});
    Movie movie8("108", {});
    Movie movie9("109", {});
    Movie movie10("110", {});
    Movie movie11("111", {});
    Movie movie12("112", {});
    Movie movie13("113", {});
    Movie movie14("114", {});
    Movie movie15("115", {});
    Movie movie16("116", {});

    // Add movies to Data
    testData.addMovie(movie);
    testData.addMovie(movie1);
    testData.addMovie(movie2);
    testData.addMovie(movie3);
    testData.addMovie(movie4);
    testData.addMovie(movie5);
    testData.addMovie(movie6);
    testData.addMovie(movie7);
    testData.addMovie(movie8);
    testData.addMovie(movie9);
    testData.addMovie(movie10);
    testData.addMovie(movie11);
    testData.addMovie(movie12);
    testData.addMovie(movie13);
    testData.addMovie(movie14);
    testData.addMovie(movie15);
    testData.addMovie(movie16);

    // Create users
    User user1("1", {movie, movie1, movie2, movie3}); // Target user
    User user2("2", {movie1, movie2, movie4, movie5, movie6}); // User with one common movie
    User user3("3", {movie1, movie4, movie5, movie7, movie8}); // User with no common movies
    User user4("4", {movie1, movie5, movie6, movie7, movie9, movie10});
    User user5("5", {movie, movie2, movie3, movie5, movie8, movie11});
    User user6("6", {movie, movie3, movie4, movie10, movie11, movie12, movie13});
    User user7("7", {movie2, movie5, movie6, movie7, movie8, movie9, movie10});
    User user8("8", {movie1, movie4, movie5, movie6, movie9, movie11, movie14});
    User user9("9", {movie, movie3, movie5, movie7, movie12, movie13, movie15});
    User user10("10", {movie, movie2, movie5, movie6, movie7, movie9, movie10, movie16});

    // Add users to Data
    testData.addUser(user1);
    testData.addUser(user2);
    testData.addUser(user3);
    testData.addUser(user4);
    testData.addUser(user5);
    testData.addUser(user6);
    testData.addUser(user7);
    testData.addUser(user8);
    testData.addUser(user9);
    testData.addUser(user10);

    // Create a Recommend object
    Recommend recommend;

    std::ostringstream outputStream;

    // Execute the recommendation
    std::vector<std::string> args = {"1", "104"};
    recommend.execute(args, outputStream);

    // Expected output
    std::string expectedOutput = "105 106 111 110 112 113 107 108 109 114\n";

    // Verify that the output matches the expected result
    ASSERT_EQ(outputStream.str(), expectedOutput);
}

// Test the "execute" method with a non-existent movie
TEST(RecommendTest, ExecuteWithNonExistentMovie) {
    // Access the Data singleton instance and clear existing data
    Data& testData = Data::getInstance();
    testData.clear();

    // Add a user to the database
    Movie movie("100", {});
    User user1("1", {movie});
    testData.addUser(user1);

    // Create a Recommend object
    Recommend recommend;

    // Use std::ostringstream for capturing output
    std::ostringstream outputStream;

    // Execute with a non-existent movie ID
    std::vector<std::string> args = {"1", "999"};
    recommend.execute(args, outputStream);

    // Verify that the output is empty or an appropriate message (depending on implementation)
    std::string expectedOutput = ""; 
    ASSERT_EQ(outputStream.str(), expectedOutput);
}

// Test: User with no history
TEST(RecommendTest, ExecuteWithUserNoHistory) {
    Data& testData = Data::getInstance();
    testData.clear();

    Movie movie("100", {});
    Movie movie2("101", {});
    testData.addMovie(movie);
    testData.addMovie(movie2);

    User user1("1", {}); // User watched nothing
    testData.addUser(user1);
    
    // Other user who watched the target movie
    User user2("2", {movie, movie2});
    testData.addUser(user2);

    Recommend recommend;
    std::ostringstream outputStream;

    // Recommend based on movie "100" for user "1"
    // Since user 1 watched nothing, they have no common movies with anyone, so no recommendations should be generated
    std::vector<std::string> args = {"1", "100"};
    recommend.execute(args, outputStream);

    ASSERT_EQ(outputStream.str(), "");
}

// Test: Target movie not watched by anyone except possibly the requester (who shouldn't be counted for self-match)
TEST(RecommendTest, ExecuteWithMovieNotWatchedByOthers) {
    Data& testData = Data::getInstance();
    testData.clear();

    Movie movie("100", {});
    testData.addMovie(movie);
    
    // Target user watched something else
    User user1("1", {movie}); 
    testData.addUser(user1);

    // Other users watched other things but NOT movie "100"
    User user2("2", {});
    testData.addUser(user2);

    Recommend recommend;
    std::ostringstream outputStream;

    std::vector<std::string> args = {"1", "100"};
    recommend.execute(args, outputStream);

    ASSERT_EQ(outputStream.str(), "");
}

// Test: Tie-breaking logic (Sort by weight desc, then ID asc)
TEST(RecommendTest, ExecuteWithTieBreaking) {
    Data& testData = Data::getInstance();
    testData.clear();
    
    Movie target("100", {});
    Movie rec1("200", {}); // Weight 1
    Movie rec2("150", {}); // Weight 1
    testData.addMovie(target);
    testData.addMovie(rec1);
    testData.addMovie(rec2);

    User user1("1", {rec1}); // Only watched rec1, but wants recs based on target
    
    User other1("2", {target, rec1});
    
    Movie common("99", {});
    testData.addMovie(common);
    
    user1 = User("1", {common});
    testData.addUser(user1);
    
    other1 = User("2", {common, target, rec1});
    testData.addUser(other1);
    
    User other2("3", {common, target, rec2});
    testData.addUser(other2);

    Recommend recommend;
    std::ostringstream outputStream;

    std::vector<std::string> args = {"1", "100"};
    recommend.execute(args, outputStream);
    
    // Both Rec1 ("200") and Rec2 ("150") have score 1 (from common movie "99").
    // Sorting: Score descending (tie). Then ID ascending.
    // "150" < "200". So "150" should come first.
    std::string expectedOutput = "150 200\n"; 
    ASSERT_EQ(outputStream.str(), expectedOutput);
}

// Test: Recommendation with large dataset (Simulated)
TEST(RecommendTest, ExecuteWithLargeDataset) {
    Data& testData = Data::getInstance();
    testData.clear();

    Movie target("100", {});
    testData.addMovie(target);
    
    int numUsers = 1000;
    std::vector<Movie> allMovies;
    for(int i=0; i<100; ++i) {
        std::string id = std::to_string(200 + i);
        allMovies.emplace_back(id, std::vector<User>{});
        testData.addMovie(allMovies.back());
    }

    // Interested user watched first 10 movies
    std::vector<Movie> watched1;
    for(int i=0; i<10; ++i) watched1.push_back(allMovies[i]);
    User user1("1", watched1);
    testData.addUser(user1);

    // Create many users who watched target + some overlapping movies
    for(int i=0; i<numUsers; ++i) {
        std::vector<Movie> watched;
        watched.push_back(target);
        // Each user watches a random subset of movies, ensuring some overlap
        for(int j=0; j<5; ++j) {
            watched.push_back(allMovies[(i + j) % 100]);
        }
        User u(std::to_string(2 + i), watched);
        testData.addUser(u);
    }

    Recommend recommend;
    std::ostringstream outputStream;
    
    auto start = std::chrono::high_resolution_clock::now();
    std::vector<std::string> args = {"1", "100"};
    recommend.execute(args, outputStream);
    auto end = std::chrono::high_resolution_clock::now();
    
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();
    EXPECT_LT(duration, 1000);
    EXPECT_FALSE(outputStream.str().empty());
}

