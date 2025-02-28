#include "ServerMenu.h"   

ServerMenu::ServerMenu(int clientSocket) : clientSocket(clientSocket) {}
//A method that gets the next command from the client and checks if it is valid syntax wise
std::vector<std::string> ServerMenu::nextCommand() {
    //A buffer to store the data received from the client
    char buffer[4096] = {0};
    //Read the data from the client
    int bytesRead = read(clientSocket, buffer, sizeof(buffer));
    //If the client disconnected or there was an error in receiving data, throw an exception
    if (bytesRead <= 0) {
        throw std::runtime_error("Client disconnected or error in receiving data.");
    }
    
    //Check if the data received contains any characters other than alphanumeric characters, spaces, and newlines
    buffer[bytesRead] = '\0';
    
    bool onlyWhitespace = true;
    for(int i = 0; i < bytesRead; i++) {
        if(buffer[i] != '\n' && buffer[i] != '\r' && buffer[i] != ' ' && buffer[i] != '\t') {
            onlyWhitespace = false;
            break;
        }
    }

    //Parse the data received into a vector of strings
    std::stringstream ss(buffer);
    std::string content = ss.str();
    for (char c : content) {
        if (c == '\n' || c == '\r') {
        continue;
        }
        if (!isalnum(c) && c != ' ') {
            displayMessage("400 Bad Request");
            return {};
        }
    }

    std::vector<std::string> request;
    std::string token;

    while (ss >> token) {
        request.push_back(token);
    }
        //Check if the request is valid syntax wise
        if (request[0] != "GET" && request[0] != "help" && request[0] != "POST"
        && request[0] != "DELETE" && request[0] != "PATCH") {
        displayMessage("400 Bad Request");
        return {};
    }
    //Check if from the second element onwards, the request contains only numbers
    for (int i=1 ; i<request.size() ; i++){
        if (!isANumber(request[i]) ){
            displayMessage("400 Bad Request");
            return {};
        }
    }
    //Check if the request is a Get request then that it has only 3 elements
    if (request[0] == "GET" && request.size() != 3) {
        displayMessage("400 Bad Request");
        return {};
    }
    //Check if the request is a Post request then that it has only 1 elements
    if (request[0] == "help" && request.size() != 1) {
        displayMessage("400 Bad Request");
        return {};
    }
   
    if((request[0] == "DELETE" || request[0] == "PATCH") && request.size() < 3) {
        displayMessage("400 Bad Request");
        return {};
    }
    if (request[0] == "POST" && request.size() < 2) {
        displayMessage("400 Bad Request");
        return {};
    }
    //Return the parsed request
    return request;
}

//A method that displays an error message to the client
void ServerMenu::displayMessage(const std::string& message) {
    sendResponse(message);
}

//A method that sends a response back to the client
void ServerMenu::sendResponse(const std::string& response) {
    std::string trimmed_response = response;
    if (!trimmed_response.empty() && trimmed_response.back() == '\n') {
        trimmed_response.pop_back();  // Remove the newline character if it's at the end
    }
    send(clientSocket, trimmed_response.c_str(), trimmed_response.size() + 1, 0);
}

//A method that checks if a string contains only numbers
bool ServerMenu::isANumber(const std::string& str) {
    for (char ch : str) {
        if (!isdigit(ch)) {
            return false;
        }
    }
    return true;
}