#ifndef IMENU_H
#define IMENU_H

#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

class IMenu{
public:
    // Destructor
    virtual ~IMenu() = default;

    // Method to get the next command - returns a vector of strings
    virtual std::vector<std::string> nextCommand() = 0;

    // Method to display an error message
    virtual void displayMessage(const std::string& toPrint) = 0;

};

#endif 