#include <gtest/gtest.h>
#include <vector>
#include <string>
#include "Movie.h"
#include "User.h"
#include "Add.h"
#include "Data.h"
#include "ICommand.h"
#include "Patch.h"
#include "Filestream.h"

class PatchTest : public ::testing::Test {
protected:
    Data& data = Data::getInstance();
    FileStream fileStream{"demo.txt"};

    void SetUp() override {
        std::remove("demo.txt");
        data.clear();
    }

    void TearDown() override {
        std::remove("demo.txt");
        data.clear();
    }

    ICommand* add = new Add(&fileStream); // Instance of Add to test
};

// Test: Add movies to an existing user "204 No Content"
TEST_F(PatchTest, ExecuteWithValidInput) {
    // Prepare data: Add user and movies
    add->execute({"1", "101", "102"}, std::cout);

    // Use std::ostringstream to capture the output
    std::ostringstream outputStream;

    // Create Patch instance and execute
    Patch patch(&fileStream);
    patch.execute({"1", "103", "104"}, outputStream);

    // Verify the response
    EXPECT_EQ(outputStream.str(), "204 No Content\n");

    // Verify the user's movies
    User* updatedUser = data.findUserById("1");
    ASSERT_NE(updatedUser, nullptr);
    EXPECT_EQ(updatedUser->getMoviesWatched().size(), 4);
    EXPECT_EQ(updatedUser->getMoviesWatched()[2].getMovieId(), "103");
    EXPECT_EQ(updatedUser->getMoviesWatched()[3].getMovieId(), "104");
}

// Test: Try to patch a non-existent user "404 Not Found"
TEST_F(PatchTest, PatchNonExistentUser) {
    // Use std::ostringstream to capture the output
    std::ostringstream outputStream;

    // Create Patch instance and execute with a non-existent user
    Patch patch(&fileStream);
    patch.execute({"1", "101", "102"}, outputStream);

    // Verify the response
    EXPECT_EQ(outputStream.str(), "404 Not Found\n");

    // Verify that the user does not exist
    User* nonExistentUser = data.findUserById("1");
    EXPECT_EQ(nonExistentUser, nullptr);
}
