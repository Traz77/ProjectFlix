#include "Post.h"

Post::Post() {
    this->add = new Add();
}

Post::Post(IStreamable* fileStream) {
    this->add = new Add(fileStream);
}

// Post creates a user 
void Post::execute(std::vector<std::string> args, std::ostream& response) {
    // Get the data singelton instance 
    Data& data = Data::getInstance();

    // Extract the user 
    std::string userId = args[0];
    User* user = data.findUserById(userId);

    // User already exists - error 
    if (user != nullptr) {
        response << "404 Not Found\n";
        return;
    }

    // User does not exist -> make one 
    add->execute(args, response);

    // User created msg 
    response << "201 Created\n";
    return;
}

std::string Post::toString () const {
    return "POST, arguments: [userid] [movieid1] [movieid2] ...";
}

ICommand* Post::getCommand() {
    return add;
}