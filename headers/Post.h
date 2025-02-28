#ifndef POST_H
#define POST_H

#include "Add.h"
#include "IServer.h"
#include "ICommand.h"
#include "User.h"
#include "Data.h"

#include <vector>
#include <string>

class Post : public ICommand {
private:
    ICommand* add;

public:
    // If a specific file to write to is needed
    Post(IStreamable* fileStream);

    Post();

    // Create new user
    void execute(std::vector<std::string> args, std::ostream& response) override;

    std::string toString() const override;

    ICommand* getCommand();
};
#endif
