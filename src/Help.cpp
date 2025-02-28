#include "Help.h"

// Constructor with commands
Help::Help(const std::map<std::string, ICommand*>& commands) : commands(commands) {}

// Default constructor with empty commands
Help::Help() : commands({}) {}

void Help::execute(std::vector<std::string> helpV, std::ostream& response) {
    if (helpV.size() != 0) {
        return;
    }
    
    // Print 200 OK first
    response << "200 OK\n";
    
    // Display the menu
    displayMenu(response);
    
    // Print help at the end
    response << "help\n";
}

// Menu 
void Help::displayMenu(std::ostream& response) {
     for (const auto& command : commands) {
        response << command.second->toString() << "\n";
    }
}

std::string Help::toString () const {
    return "help";
}
