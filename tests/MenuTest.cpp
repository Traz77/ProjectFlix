#include <gtest/gtest.h>
#include "Menu.h"
#include <sstream>
#include "App.h"
#include "ICommand.h"

// Fixture for Menu tests
class MenuTest : public ::testing::Test {
protected:
    Menu menu; // Instance of Menu to test
};

// Test displayError method
TEST_F(MenuTest, ErrorTest) {
    testing::internal::CaptureStdout(); // Redirect standard output
    menu.displayMessage("Error message test");
    std::string output = testing::internal::GetCapturedStdout();

    // Verify output
    EXPECT_EQ(output, "Error message test\n");
}

// Test nextCommand with a valid  command
TEST_F(MenuTest, NextCommandValid) {
    // Simulate input for "help"
    std::istringstream input("help");
    std::cin.rdbuf(input.rdbuf());

    // Get the next command
    std::vector<std::string> commands = menu.nextCommand();

    // Verify parsed commands
    ASSERT_EQ(commands.size(), 1);
    EXPECT_EQ(commands[0], "help");
}


// Test nextCommand with an invalid command
TEST_F(MenuTest, NextCommandInvalid) {
    // Simulate input for an invalid command
    std::istringstream input("invalidCommand");
    std::cin.rdbuf(input.rdbuf());

    // Get the next command
    std::vector<std::string> commands = menu.nextCommand();

    // Verify the output is parsed correctly even if the command is invalid in App
    ASSERT_EQ(commands.size(), 1);
    EXPECT_EQ(commands[0], "invalidCommand");
}