#ifndef TCPSERVER_H
#define TCPSERVER_H

#include "ClientHandler.h"
#include <iostream>
#include <netinet/in.h>
#include <unistd.h>
#include <vector>
#include <vector>
#include <mutex>
#include "SimpleThreadManager.h"
#include "IServer.h"
#include <atomic>

class TCPServer : public IServer {
public:
    // Constructor with given port 
    TCPServer(int port);
    
    void start() override;

    void stop() override;

private:
    int port;
    int serverSocket;
    std::mutex clientsMutex;

    // Accepting clients with connected to the server socker 
    void acceptClients(int serverSocket, IThreadManager* threadManager);

    // Thread safety for the running flag
    std::atomic<bool> running;

};

#endif