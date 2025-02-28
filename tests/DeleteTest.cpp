#include <iostream>
#include <gtest/gtest.h>
#include "../headers/Post.h"
#include "../headers/Add.h"
#include "../headers/Data.h"
#include "Delete.h"
#include "Filestream.h"
#include <sstream>

using namespace std;

class DeleteTest : public ::testing::Test {
protected:
    FileStream fileStream{"demo.txt"};
    Data& data = Data::getInstance();

    void SetUp() override {
        std::remove("demo.txt");
        data.clear();
    }

    void TearDown() override {
        std::remove("demo.txt");
        data.clear();
    }
};

// Test valid delete
TEST_F(DeleteTest, ValidDelete) {
    Add add(&fileStream);
    Delete deleteCommand(&fileStream);

    // Add users and movies
    vector<string> commands1 = {"1", "100", "102", "113", "114", "120"};
    vector<string> commands2 = {"2", "106", "102", "112", "114", "120"};
    add.execute(commands1, std::cout);
    add.execute(commands2, std::cout);

    // Use ostringstream to capture the response
    std::ostringstream outputStream;

    // Execute delete commands
    vector<string> moviesToDelete1 = {"1", "102", "113"};
    deleteCommand.execute(moviesToDelete1, outputStream);

    EXPECT_EQ(data.findUserById("1")->getMoviesWatched().size(), 3);
    EXPECT_EQ(data.findUserById("1")->getMoviesWatched()[0].getMovieId(), "100");
    EXPECT_EQ(data.findUserById("1")->getMoviesWatched()[1].getMovieId(), "114");
    EXPECT_EQ(data.findUserById("1")->getMoviesWatched()[2].getMovieId(), "120");
    EXPECT_EQ(outputStream.str(), "204 No Content\n");

    // Further delete
    vector<string> moviesToDelete2 = {"2", "106", "120"};
    outputStream.str(""); // Clear the stream for reuse
    outputStream.clear();
    deleteCommand.execute(moviesToDelete2, outputStream);

    EXPECT_EQ(data.findUserById("2")->getMoviesWatched().size(), 3);
    EXPECT_EQ(outputStream.str(), "204 No Content\n");
}

// Test invalid delete
TEST_F(DeleteTest, InvalidDelete) {
    Add add(&fileStream);
    Delete deleteCommand(&fileStream);

    // Add users and movies
    vector<string> commands1 = {"1", "100", "102", "113", "114", "120"};
    add.execute(commands1, std::cout);

    // Use ostringstream to capture the response
    std::ostringstream outputStream;

    // Attempt to delete from a non-existent user
    vector<string> moviesToDelete = {"2", "102", "113"};
    deleteCommand.execute(moviesToDelete, outputStream);

    EXPECT_EQ(outputStream.str(), "404 Not Found\n");
    EXPECT_EQ(data.findUserById("1")->getMoviesWatched().size(), 5);
}

// Integration test
TEST_F(DeleteTest, IntegrationWithDelete) {
    Add add(&fileStream);
    Delete deleteCommand(&fileStream);

    // Add users and movies
    vector<string> commands1 = {"1", "101", "123", "131", "142"};
    vector<string> commands2 = {"2", "112", "126", "138", "149", "500"};
    add.execute(commands1, std::cout);
    add.execute(commands2, std::cout);

    // Use ostringstream to capture the response
    std::ostringstream outputStream;

    // Execute delete
    vector<string> moviesToDelete1 = {"1", "101", "123"};
    deleteCommand.execute(moviesToDelete1, outputStream);

    EXPECT_EQ(data.findUserById("1")->getMoviesWatched().size(), 2);
    EXPECT_EQ(data.findUserById("1")->getMoviesWatched()[0].getMovieId(), "131");
    EXPECT_EQ(data.findUserById("1")->getMoviesWatched()[1].getMovieId(), "142");

    EXPECT_EQ(outputStream.str(), "204 No Content\n");
}
