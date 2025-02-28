#include "ClientHandler.h"

// Constructor
ClientHandler::ClientHandler(int clientSocket, IThreadManager* threadManager)
    : clientSocket(clientSocket), threadManager(threadManager) {}

// Start handling the client using the thread manager
void ClientHandler::start() {
    threadManager->execute([this]() {
        this->handleClient();
    });
}

void ClientHandler::join() {
    if (workerThread.joinable()) {
        workerThread.join();
    }
}

void ClientHandler::handleClient() {
    try {
        ServerMenu menu(clientSocket);
        std::map<std::string, ICommand*> commands;

        FileStream fileStream;
        commands["POST"] = new Post();
        commands["PATCH"] = new Patch();
        commands["GET"] = new Get();
        commands["DELETE"] = new Delete();
        commands["help"] = new Help(commands);

        // Create App instance
        App app(&menu, commands);

        // Run the app for the client
        app.run();

    } catch (const std::exception& e) {
    }

    if (clientSocket >= 0) {
        close(clientSocket);
        clientSocket = -1; 
        
    }
}
