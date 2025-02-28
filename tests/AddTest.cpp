#include <gtest/gtest.h>
#include <vector>
#include <string>
#include "Movie.h"
#include "User.h"
#include "Add.h"
#include "Data.h"
#include "Filestream.h"
 
class AddTest : public ::testing::Test {
protected:
    FileStream fileStream{"demo.txt"};
    Data& data = Data::getInstance();

    void SetUp() override {
        std::remove("demo.txt");
    }
    void TearDown() override {
        std::remove("demo.txt");
    }
};

TEST_F(AddTest, testAdd) {
    
    std::vector<std::string> input = {"14","104","107"};
    std::vector<std::string> input2 = {"14","104","108"};
    std::vector<std::string> input3 = {"14","107","108"};
    std::vector<std::string> input4 = {"42"};
    std::vector<std::string> input5 = {};
    

    Add add(&fileStream);
    Add add2(&fileStream);
    Add add3(&fileStream);
    Add add4(&fileStream);
    Add add5(&fileStream);

    
    add.execute(input, std::cout);
    add2.execute(input2, std::cout);
    add3.execute(input3, std::cout);
    add4.execute(input4, std::cout);
    add5.execute(input5, std::cout);

    

    //Data& data = Data::getInstance();
    User* user = data.findUserById("14");
    EXPECT_NE(user, nullptr);

    const std::vector<Movie>& movies = user->getMoviesWatched();
    std::vector<std::string> checkWith = {"104", "107", "108"};
    std::vector<std::string> fromUser;
    for (int i = 0; i < 3; i++) {
        fromUser.push_back(movies[i].getMovieId());
    }
    EXPECT_EQ(checkWith.size(), fromUser.size());
    EXPECT_TRUE(std::is_permutation(checkWith.begin(), checkWith.end(), fromUser.begin()));
    User* user2 = data.findUserById("42");
    const std::vector<Movie>& movies2 = user2->getMoviesWatched();
    EXPECT_NE(user2, nullptr);
    EXPECT_EQ(movies2.size(), 0);
}