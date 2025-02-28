#include "Menu.h"

// Method to display an error message - gets a string as input and prints it to the console
void Menu::displayMessage(const std::string& toPrint){ 
    std::cout << toPrint << std::endl;
}
/* Method to get the next command - returns a vector of strings
 * Checking for invalid input: only allow English letters, numbers, and spaces
 * This method reads the next line from the console and splits it into a vector of strings
 * The vector is then returned
 */
std::vector<std::string> Menu::nextCommand(){
    std::vector<std::string> commands;

    std::string wholeCommand;

    std::getline(std::cin, wholeCommand);

    std::istringstream stream(wholeCommand);

    std::string command;

    // Validate input: only allow English letters, numbers, and spaces
    for (char ch : wholeCommand) {
        if (!std::isalnum(ch) && ch != ' ') {
            return {};
        }
    }

    while (stream >> command) {
        commands.push_back(command);
    }
    return commands;
}

