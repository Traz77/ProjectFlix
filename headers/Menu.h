#ifndef MENU_H
#define MENU_H

#include "IMenu.h"

#include <sstream>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

class Menu : public IMenu {
public:
    // Method to display Error message
    void displayMessage(const std::string& toPrint) override;

    // Method to get the next command
    std::vector<std::string> nextCommand() override;
};

#endif 
