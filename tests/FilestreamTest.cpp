#include "Filestream.h"
#include "User.h"
#include "Movie.h"
#include <gtest/gtest.h>
#include <fstream>
#include <cstdio>

class FileStreamTest : public ::testing::Test {
protected:
    std::string demo = "demo.txt";
    FileStream fileStream1{demo};

    // Demo users for testing - the movie-userValues are impety intentionally 
    // because they are ignored and are not read in the fileStream class
    User user1 = {"Tal", {Movie("101", {}), Movie("123", {}), Movie("131", {}), Movie("142", {})}};
    User user2 = {"Hen", {Movie("112", {}), Movie("126", {}), Movie("138", {}), Movie("149", {}), Movie("500", {})}};
    User user3 = {"Omri", {Movie("111", {}), Movie("222", {}), Movie("333", {}), Movie("444", {})}};
    User user4 = {"Raz", {Movie("555", {}), Movie("222", {}), Movie("333", {}), Movie("444", {})}};

    // reset after every test.
    void SetUp() override {
        std::remove(demo.c_str());
    }

    void TearDown() override {
        std::remove(demo.c_str());
    }
};


TEST_F(FileStreamTest, ReadEmptyFile) {
    // No exception is thrown when reading an empty file
    ASSERT_NO_THROW(fileStream1.read());
}

// checking the class creates a new file and add the user accordingly.
TEST_F(FileStreamTest, CreateFileAndWriteUser) {
    fileStream1.write(user1);
    std::vector<User> users = fileStream1.read();

    EXPECT_EQ(users.size(), 1);
    EXPECT_EQ(users[0].getUserID(), user1.getUserID());
    EXPECT_EQ(users[0].getMoviesWatched(), user1.getMoviesWatched());
}

// adding 4 users and check the data is stored as it should. 
TEST_F(FileStreamTest, MultipleUserValidation) {
    // write the users to the file 
    fileStream1.write(user1);
    fileStream1.write(user2);
    fileStream1.write(user3);
    fileStream1.write(user4);

    // saving the users in readUsers and checking size is correct  
    std::vector<User> readUsers = fileStream1.read();
    ASSERT_EQ(readUsers.size(), 4);

    // check each user data 
    EXPECT_EQ(readUsers[0].getUserID(), user1.getUserID());
    EXPECT_EQ(readUsers[0].getMoviesWatched(), user1.getMoviesWatched());
    EXPECT_EQ(readUsers[1].getUserID(), user2.getUserID());
    EXPECT_EQ(readUsers[1].getMoviesWatched(), user2.getMoviesWatched());
    EXPECT_EQ(readUsers[2].getUserID(), user3.getUserID());
    EXPECT_EQ(readUsers[2].getMoviesWatched(), user3.getMoviesWatched());
    EXPECT_EQ(readUsers[3].getUserID(), user4.getUserID());
    EXPECT_EQ(readUsers[3].getMoviesWatched(), user4.getMoviesWatched());
}

// check if filestream handle updating movies and not breaking order or data 
TEST_F(FileStreamTest, UpdateMovies) {
    fileStream1.write(user1);
    fileStream1.write(user2);
    fileStream1.write(user3);
    fileStream1.write(user4);

    std::vector<Movie> updatedMovies = {Movie("111", {}), Movie("222", {}), Movie("333", {}), Movie("444", {}), Movie("667", {}), Movie("728", {})};
    User updatedUser3 = user3;
    updatedUser3.setMoviesWatched(updatedMovies);

    fileStream1.updateMovies(updatedUser3, updatedMovies);

    // verify data 
    std::vector<User> readUsers = fileStream1.read();
    EXPECT_EQ(readUsers[2].getMoviesWatched(), updatedMovies);
}

// a more comprehensive test of adding 20 users to the file and check they are stored as they should 
TEST_F(FileStreamTest, ComprehensiveTest) { 
    int numOfUsers = 20;
    std::vector<User> toCompareAfter;
    for (int i = 0; i < 20; i++) {
        // creating the movies vector for each user
        std::vector<Movie> movies = {
            Movie("100" + std::to_string(i), {}), Movie("101" + std::to_string(i), {}),
            Movie("102" + std::to_string(i), {}), Movie("103" + std::to_string(i), {}),
            Movie("105" + std::to_string(i), {})
        };
        // creating and writing the user and putting the user in ToCompareAfter to compare after the read
        User generator = {"user" + std::to_string(i), movies};
        fileStream1.write(generator);
        toCompareAfter.push_back(generator);
    }
    // size should be equal - 20 
    EXPECT_EQ (toCompareAfter.size(), numOfUsers);
    // read all users from file and verify data 
    std::vector<User> fromFile = fileStream1.read();
    for (int i = 0; i < numOfUsers; i++) {
        EXPECT_EQ(fromFile[i].getUserID(), toCompareAfter[i].getUserID());
        EXPECT_EQ(fromFile[i].getMoviesWatched(), toCompareAfter[i].getMoviesWatched());
    }
}
