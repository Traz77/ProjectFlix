#ifndef ADD_H
#define ADD_H

#include "IStreamable.h"
#include "ICommand.h"
#include "User.h"
#include "Movie.h"
#include "Data.h"
#include "Filestream.h"

#include <string>
#include <vector>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>
#include <cctype>

class Add : public ICommand {
private:
    // Method to check if a string is a number
    bool isNumber(const std::string& str);

    IStreamable* fileStream;

public:
    Add();

    Add(IStreamable* fileStream);

    // Initiate Add command
    void execute(std::vector<std::string> commands, std::ostream& response) override;
};

#endif 