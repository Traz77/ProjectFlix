#include <iostream>
#include <gtest/gtest.h>
#include "../headers/Get.h"
#include "../headers/User.h"
#include "../headers/Recommend.h"
#include "../headers/Data.h"
#include "../headers/ICommand.h"
#include "../headers/IServer.h"
#include "../headers/Post.h"
#include "../headers/Add.h"
#include "Filestream.h"
#include <vector>
#include <string>
#include <sstream>

using namespace std;

class GetTest : public ::testing::Test {
protected:
    FileStream fileStream{"demo.txt"};
    ICommand* recommend = new Recommend();
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


TEST_F(GetTest, ExecuteValidInput) {
    // Prepare test data
    vector<string> commands = {"1", "101"};
    vector<string> commands2 = {"2", "101", "102", "103", "104", "105"};
    Get get1;

    std::ostringstream outputStream;

    // Add test users and movies
    ICommand* add = new Add(&fileStream);
    Post post1(&fileStream);
    post1.execute(commands, outputStream);
    outputStream.str("");
    outputStream.clear();
    post1.execute(commands2, outputStream);
    outputStream.str("");
    outputStream.clear();
    // Execute Get
    get1.execute(commands, outputStream);

    // Verify the response
    std::string expectedOutput = "200 OK\n\n102 103 104 105\n";
    EXPECT_EQ(outputStream.str(), expectedOutput);
}

TEST_F(GetTest, ExecuteInvalidInput) {
    vector<string> commands = {"1", "101"};
    Get get1;

    // Prepare the output stream
    std::ostringstream outputStream;

    // Execute Get with invalid data (no user or movie)
    get1.execute(commands, outputStream);

    // Verify the response
    std::string expectedOutput = "404 Not Found\n";
    EXPECT_EQ(outputStream.str(), expectedOutput);
}
