#include "ServerMenu.h"   

ServerMenu::ServerMenu(int clientSocket) : clientSocket(clientSocket) {}

//A method that gets the next command from the client and checks if it is valid syntax wise
std::vector<std::string> ServerMenu::nextCommand() {
    // Check if we already have a complete command in the buffer
    size_t newlinePos = inputBuffer.find('\n');
    
    // If no newline, read more data until we find one
    while (newlinePos == std::string::npos) {
        char buffer[4096] = {0};
        int bytesRead = read(clientSocket, buffer, sizeof(buffer));
        
        if (bytesRead <= 0) {
            throw std::runtime_error("Client disconnected or error in receiving data.");
        }
        
        inputBuffer.append(buffer, bytesRead);
        newlinePos = inputBuffer.find('\n');
    }
    
    // Extract the command line
    std::string line = inputBuffer.substr(0, newlinePos);
    // Remove the command line from buffer (+1 for newline)
    inputBuffer.erase(0, newlinePos + 1);
    
    // Remove \r if present (e.g. from Windows clients)
    if (!line.empty() && line.back() == '\r') {
        line.pop_back();
    }
    
    // Validation: Check for non-alphanumeric chars (allowing space)
    for (char c : line) {
        if (!isalnum(c) && c != ' ' && c != '\r') {
            displayMessage("400 Bad Request (INVALID CHAR: " + std::string(1, c) + ")");
            return {};
        }
    }

    // Parse into tokens
    std::stringstream ss(line);
    std::vector<std::string> request;
    std::string token;

    while (ss >> token) {
        request.push_back(token);
    }
    
    //Check if the request is valid syntax wise
    if (request.empty() || (request[0] != "GET" && request[0] != "help" && request[0] != "POST"
        && request[0] != "DELETE" && request[0] != "PATCH")) {
        displayMessage("400 Bad Request");
        return {};
    }
    
    //Check if from the second element onwards, the request contains only numbers
    for (int i = 1; i < request.size(); i++) {
        if (!isANumber(request[i])) {
            displayMessage("400 Bad Request (NOT A NUMBER: " + request[i] + ")");
            return {};
        }
    }
    
    //Check if the request is a Get request then that it has only 3 elements
    if (request[0] == "GET" && request.size() != 3) {
        displayMessage("400 Bad Request");
        return {};
    }
    
    //Check if the request is a help request then that it has only 1 element
    if (request[0] == "help" && request.size() != 1) {
        displayMessage("400 Bad Request");
        return {};
    }
   
    if ((request[0] == "DELETE" || request[0] == "PATCH") && request.size() < 3) {
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
    if (message.find("400") != std::string::npos) {
    }
    sendResponse(message);
}

//A method that sends a response back to the client
void ServerMenu::sendResponse(const std::string& response) {
    std::string message = response;
    
    // Ensure the message ends with a newline character
    if (message.empty() || message.back() != '\n') {
        message += '\n';
    }
    
    // Send the complete message including the newline
    send(clientSocket, message.c_str(), message.length(), 0);
}

//A method that checks if a string contains only numbers
bool ServerMenu::isANumber(const std::string& str) {
    if (str.empty()) {
        return false;
    }
    
    for (char ch : str) {
        if (!isdigit(ch)) {
            return false;
        }
    }
    return true;
}