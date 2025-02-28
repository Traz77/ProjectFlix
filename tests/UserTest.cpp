#include <gtest/gtest.h>
#include "User.h" 
#include "Movie.h" 

class UserTest : public ::testing::Test {
protected:
    std::string expectedUserID;                
    std::vector<Movie> expectedMovies;          
    std::vector<User> usersWatched;
    User* userInstance;                     

    void SetUp() override {
        // Initialize expected data
        expectedUserID = "12345";
        usersWatched = {};
        expectedMovies = {
            Movie("101",usersWatched),
            Movie("150",usersWatched),
            Movie("199",usersWatched)
        };
        // Create a User object with the expected data
        userInstance = new User(expectedUserID, expectedMovies);

    };
    // Teardown method (called after each test)
    void TearDown() override {
        // Clean up dynamically allocated memory
        delete userInstance;
    }
};

// Test: Verify that the constructor stores values correctly
TEST_F(UserTest, ConstructorStoresValuesCorrectly) {
    // Assert the user ID is as expected
    EXPECT_EQ(userInstance->getUserID(), expectedUserID);

    // Assert the movies list size is as expected
    const std::vector<Movie>& moviesFromGetter = userInstance->getMoviesWatched();
    ASSERT_EQ(moviesFromGetter.size(), expectedMovies.size());

    // Assert each movie's ID matches the expected data
    for (size_t i = 0; i < expectedMovies.size(); ++i) {
        EXPECT_EQ(moviesFromGetter[i].getMovieId(), expectedMovies[i].getMovieId());
    }
};  



