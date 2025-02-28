/*
A class that represents the menu for the server side of the application. 
It is responsible for getting the next command from the client and sending a response back to the client. 
It also checks if the input is valid syntax wise. 
It inherits from the IMenu interface.
*/
#ifndef SERVERMENU_H
#define SERVERMENU_H

#include "IMenu.h"
#include "ServerMenu.h"  
#include <sys/socket.h>   
#include <unistd.h>       
#include <stdexcept>      
#include <cstring>        
#include <sstream>        
#include <vector>         
#include <string>  

class ServerMenu : public IMenu {
public:
    ServerMenu(int clientSocket);
    std::vector<std::string> nextCommand() override;
    void displayMessage(const std::string& message) override;
    

private:
    int clientSocket;
    bool isANumber(const std::string& str);
    void sendResponse(const std::string& response);
};

#endif // SERVERMENU_H
