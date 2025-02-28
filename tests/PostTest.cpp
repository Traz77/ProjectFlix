#include <iostream>
#include <gtest/gtest.h>
#include "../headers/Post.h"
#include "../headers/User.h"
#include "../headers/Add.h"
#include "../headers/Data.h"
#include "../headers/ICommand.h"
#include "Filestream.h"
#include <vector>
#include <string>
#include <sstream>


using namespace std;

class PostTest : public ::testing::Test {
protected:
    FileStream fileStream{"demo.txt"};

    void SetUp() override {
        std::remove("demo.txt");
        Data::getInstance().clear();
    }

    void TearDown() override {
        std::remove("demo.txt");
        Data::getInstance().clear();
    }

    ICommand* add = new Add(&fileStream);
    Data& data = Data::getInstance();
};

// Test valid execution
TEST_F(PostTest, ExecuteValidInput) {
    vector<string> commands = {"1", "101", "102", "103", "104", "105"};

    // Use std::ostringstream to capture the output
    std::ostringstream outputStream;

    Post post1(&fileStream); 
    post1.execute(commands, outputStream);

    // Check the response
    EXPECT_EQ(outputStream.str(), "201 Created\n");

    // Verify data
    EXPECT_EQ(data.getUsers().size(), 1);
    EXPECT_EQ(data.findUserById("1")->getUserID(), "1");
    EXPECT_EQ(data.findMovieById("101")->getMovieId(), "101");
    EXPECT_EQ(data.findMovieById("102")->getMovieId(), "102");
    EXPECT_EQ(data.findMovieById("103")->getMovieId(), "103");
    EXPECT_EQ(data.findMovieById("104")->getMovieId(), "104");
    EXPECT_EQ(data.findMovieById("105")->getMovieId(), "105");
    EXPECT_EQ(data.findUserById("1")->getMoviesWatched().size(), 5);
    EXPECT_EQ(data.findUserById("1")->getMoviesWatched()[0].getMovieId(), "101");
    EXPECT_EQ(data.findUserById("1")->getMoviesWatched()[1].getMovieId(), "102");
    EXPECT_EQ(data.findUserById("1")->getMoviesWatched()[2].getMovieId(), "103");
    EXPECT_EQ(data.findUserById("1")->getMoviesWatched()[3].getMovieId(), "104");
    EXPECT_EQ(data.findUserById("1")->getMoviesWatched()[4].getMovieId(), "105");
}

// Test invalid execution
TEST_F(PostTest, ExecuteInvalidInput) {
    vector<string> commands = {"1", "101", "102", "103", "104", "105"};

    // Capture the output
    std::ostringstream outputStream;

    Post post1(&fileStream); 
    post1.execute(commands, outputStream);

    // Check the response
    EXPECT_EQ(outputStream.str(), "201 Created\n"); 

    std::ostringstream outputStream1;
    post1.execute(commands, outputStream1);
    // Verify no user was created
    EXPECT_EQ(outputStream1.str(), "404 Not Found\n");
}
