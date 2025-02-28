#include "Get.h"

using namespace std;

Get::Get() {
    this->recommend = new Recommend;
}

void Get::execute(vector<string> commands, std::ostream& response) {
    // Get the data singelton instance 
    Data& data = Data::getInstance();

    // Extract the user and movie to recommend by 
    string userId = commands[0];
    User* user = data.findUserById(userId);
    string movieId = commands[1];
    Movie* movie = data.findMovieById(movieId);

    // User or Movie non existing 
    if (user == nullptr || movie == nullptr) {
        response << ("404 Not Found\n");
        return;
    }
    // Command is legal 
    response << ("200 OK\n\n");

    // Print the recommendations 
    recommend->execute(commands, response);
    return;
}

std::string Get::toString () const {
    return "GET, arguments: [userid] [movieid]";
}

ICommand* Get::getCommand() {
    return recommend;
}

