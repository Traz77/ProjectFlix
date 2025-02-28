#include "Patch.h"

Patch::Patch() {
    this->add = new Add();
}

Patch::Patch(IStreamable* fileStream) {
    this->add = new Add(fileStream);
}

// Patch updates the User's watched movies list 
void Patch::execute(std::vector<std::string> args, std::ostream& response) {
    // Get the data singelton instance 
    Data &data = Data::getInstance();

    // Extract the user 
    std::string userId = args[0];
    User *user = data.findUserById(userId);

    // User non existing - return error 
    if (user == nullptr) {
        response << "404 Not Found\n";
        return;
    }

    // Add the user 
    add->execute(args, response);
    // Executed successfully 
    response << "204 No Content\n";
    return;
}

std::string Patch::toString () const {
    return "PATCH, arguments: [userid] [movieid1] [movieid2] ...";
}