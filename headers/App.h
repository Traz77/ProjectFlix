#ifndef APP_H
#define APP_H

#include "Menu.h"
#include "Add.h"
#include "Help.h"
#include "Recommend.h"
#include "Data.h"
#include "Filestream.h"
#include "User.h"
#include "ServerMenu.h"
#include "ICommand.h"

#include <ostream>
#include <map>
#include <map>
#include <string>

class App {
private:
    IMenu* menu;
    std::map<std::string, ICommand*> commands;

public:
    // Constructor with explicit commands
    App(IMenu* menu, std::map<std::string, ICommand*> commands);

    // Constructor with a default map of commands
    App(IMenu* menu);

    // Destructor
    ~App();

    // Method to run the application
    virtual void run();
};

#endif 