#include <gtest/gtest.h>
#include <vector>
#include "Movie.h"
#include "User.h"
#include <stdexcept>

TEST(MovieTest, testMovieConstructor) {
    std::vector<User> users = {User("1", std::vector<Movie>()), User("2", std::vector<Movie>())};
    Movie movie("104", users);
    EXPECT_EQ(movie.getMovieId(), "104");
    EXPECT_EQ(movie.getUsersWatched(), users); // Compare the entire vector, assuming operator== is defined for User
}

TEST(MovieTest, testMovieWrongInput) {
    Movie movie1(" ", std::vector<User>());  
    EXPECT_EQ(movie1.getMovieId(), "");      

    Movie movie2("abc", std::vector<User>()); 
    EXPECT_EQ(movie2.getMovieId(), "");       
}


TEST(MovieTest, testMovieAddUser) {
    User user("1", std::vector<Movie>());
    Movie movie("104", std::vector<User>());
    movie.addUser(user);
    EXPECT_EQ(movie.getUsersWatched().size(), 1);
    EXPECT_EQ(movie.getUsersWatched()[0], user); // Compare the first user
}

TEST(MovieTest, testGetMovieObject) {
    User user("1", std::vector<Movie>());
    Movie movie("104", std::vector<User>());
    movie.addUser(user);
    EXPECT_EQ(movie.getUsersWatched()[0], user); // Ensure the first user matches
}
