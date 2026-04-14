#include "TCPServer.h"
#include "ThreadPoolManager.h"
#include "Filestream.h"
#include <netinet/tcp.h>

// Initialize the server with the given port
TCPServer::TCPServer(int port) : port(port), serverSocket(-1), running(false) {}

void TCPServer::start() {
    running = true;

    // Create a socket for the server
    serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket == -1) {
        throw std::runtime_error("Failed to create socket");
    }

    int opt = 1;
    setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    // Set up server IPV4 and Accept all clients
    sockaddr_in serverAddr{};
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(port);

    // Connect the socket to the address
    if (bind(serverSocket, (struct sockaddr*)&serverAddr, sizeof(serverAddr)) < 0) {
        close(serverSocket);
        throw std::runtime_error("Bind failed");
    }

    // Start listening with large backlog to handle burst concurrent connections
    if (listen(serverSocket, SOMAXCONN) < 0) {
        close(serverSocket);
        throw std::runtime_error("Listen failed");
    }

    // Create ThreadPoolManager with 50 threads
    ThreadPoolManager threadManager(50);

    // Initialize data from file ONCE at server startup
    FileStream fileStream;
    fileStream.initiate();
    std::cout << "Data initialized from file." << std::endl;

    // Pass the thread manager to acceptClients
    acceptClients(serverSocket, &threadManager);

    close(serverSocket);
}

void TCPServer::acceptClients(int serverSocket, IThreadManager* threadManager) {
    // Maintain the existing logic
    std::vector<ClientHandler*> clients;

    while (running.load()) {
        int clientSocket = accept(serverSocket, nullptr, nullptr);
        if (clientSocket < 0) {
            if (running.load()) {
                std::cerr << "Failed to accept client\n";
            }
            continue;
        }

        // Disable Nagle's algorithm for low-latency small responses
        int flag = 1;
        setsockopt(clientSocket, IPPROTO_TCP, TCP_NODELAY, &flag, sizeof(flag));

        // Create a client handler for the client
        ClientHandler* clientHandler = new ClientHandler(clientSocket, threadManager);
        clientHandler->start();
        clients.push_back(clientHandler);
    }

    // work on the client thread and delete it after finish
    for (auto client : clients) {
        client->join();
        delete client;
    }
}

void TCPServer::stop() {
    running.store(false);
    if (serverSocket != -1) {
        shutdown(serverSocket, SHUT_RDWR);
        close(serverSocket);
        serverSocket = -1;
    }
}

