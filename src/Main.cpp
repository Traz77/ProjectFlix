#include "TCPServer.h"
#include <iostream>
#include <cstdlib> 

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: ./myapp <port>" << std::endl;
        return 1;
    }

    int port = std::atoi(argv[1]); 
    if (port <= 0) {
        std::cerr << "Invalid port number." << std::endl;
        return 1;
    }

    try {
        TCPServer server(port);
        server.start();
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }
    return 0;
}
