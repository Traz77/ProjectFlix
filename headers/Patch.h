#ifndef PATCH_H
#define PATCH_H

#include "IServer.h"
#include "ICommand.h"
#include "User.h"
#include "Data.h"
#include "Add.h"

#include <vector>
#include <string>

class Patch : public ICommand {
private:
    ICommand* add;

public:
    Patch();
    ~Patch() { delete add; }  // Clean up allocated memory

    // Write to specific file if needed
    Patch(IStreamable* fileStream);

    // Update a user's watch list
    void execute(std::vector<std::string> args, std::ostream& response) override;

    std::string toString() const override;
};

#endif