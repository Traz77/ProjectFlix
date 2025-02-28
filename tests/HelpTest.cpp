#include <gtest/gtest.h>
#include "Help.h"
#include "ICommand.h"
#include <map>
#include <vector>
#include <string>
#include <sstream>

// Generic command class
class GenCommand : public ICommand {
public:
    GenCommand(const std::string& description) : description(description) {}
    
    void execute(std::vector<std::string> args, std::ostream& response) override {}

    std::string toString() const override {
        return description;
    }

private:
    std::string description;
};

// Test for Help
TEST(HelpTest, GeneralDisplay) {
    // Create generic commands
    GenCommand command1("COMMAND1, arguments: [arg1]");
    GenCommand command2("COMMAND2, arguments: [arg1] [arg2]");
    GenCommand command3("COMMAND3");

    // Create a map of commands
    std::map<std::string, ICommand*> commands = {
        {"command1", &command1},
        {"command2", &command2},
        {"command3", &command3}
    };

    // Create Help object
    Help help(commands);

    // Use std::ostringstream to capture the output
    std::ostringstream outputStream;

    // Run the function with the output stream
    help.execute({}, outputStream);

    // Check the output
    std::string expectedOutput = 
        "200 OK\nCOMMAND1, arguments: [arg1]\n"
        "COMMAND2, arguments: [arg1] [arg2]\n"
        "COMMAND3\nhelp\n";
    EXPECT_EQ(outputStream.str(), expectedOutput);
}
