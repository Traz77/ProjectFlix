#ifndef HELP_H
#define HELP_H

#include "ICommand.h"

#include <string>
#include <iostream>
#include <vector>
#include <map>

class Help : public ICommand { 
private:
    std::map<std::string, ICommand*> commands;

    void displayMenu(std::ostream& response);

public:
    // Default constructor
    Help();

    // Constructor with commands
    Help(const std::map<std::string, ICommand*>& commands);

    void execute(std::vector<std::string>,std::ostream& response) override;

    std::string toString() const override;
};

#endif 
