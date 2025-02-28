#include "App.h"

// Constructor with explicit commands
App::App(IMenu* menu, const std::map<std::string, ICommand*> commands) : menu(menu), commands(commands) {}

// Default constructor with no commands
App::App(IMenu* menu) : menu(menu) {} 

// Destructor
App::~App(){
    for (auto command : commands){
        delete command.second;
    }
}

// Method to run the application
void App::run() {
    // Load all data and Users from fileStream
    FileStream fileStream;
    fileStream.initiate();

    while (true) {
        // Get the next command from the menu - a vector of strings
        std::vector<std::string> command = menu->nextCommand();
        // Check if the command is empty
        if (command.size() == 0) {
            continue;
        }

        // Extract the command name and remove it from the vector
        std::string commandName = command[0];
        command.erase(command.begin());

        // Check if the command is valid
        try {
            std::stringstream response;
            // Execute and result -> response 
            commands[commandName]->execute(command, response);

            menu->displayMessage(response.str());
            
        } catch (...) {
            menu->displayMessage("400 Bad Request");
        }
    }
}