#ifndef ICOMMAND_H
#define ICOMMAND_H

#include <vector>
#include <string>
#include <ostream>

class ICommand{
public:
    virtual ~ICommand() = default;

    // Method to execute the command - takes a vector of strings as input
    virtual void execute(std::vector<std::string>, std::ostream& response) = 0;

    virtual std::string toString() const {
        return "";
    }
};

#endif 