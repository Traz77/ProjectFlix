#include <gtest/gtest.h>
#include <thread>
#include <chrono>
#include "TCPServer.h"
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>

class TCPServerTest : public ::testing::Test {
protected:
    TCPServer* server = nullptr;
    std::thread serverThread;

    void SetUp() override {
        int testSocket = socket(AF_INET, SOCK_STREAM, 0);

        sockaddr_in addr{};
        addr.sin_family = AF_INET;
        addr.sin_addr.s_addr = INADDR_ANY;
        addr.sin_port = htons(8081);

        close(testSocket);
    }

    void TearDown() override {
        if (server) {
            server->stop();
            if (serverThread.joinable()) {
                serverThread.join();
            }
            delete server;
            server = nullptr;
        }
    }
};

// Test server initialization
TEST_F(TCPServerTest, Init) {
    ASSERT_NO_THROW({ server = new TCPServer(8081); });
}

// Test server start and stop mechanism
TEST_F(TCPServerTest, StartAndStop) {
    // Create server
    server = new TCPServer(8081);

    // Start server in a separate thread
    serverThread = std::thread([this]() {
        server->start();
    });

    // Give server a moment to start
    std::this_thread::sleep_for(std::chrono::milliseconds(100));

    // Verify server is running by trying to connect
    int clientSocket = socket(AF_INET, SOCK_STREAM, 0);
    ASSERT_NE(clientSocket, -1);

    sockaddr_in serverAddr{};
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = inet_addr("127.0.0.1");
    serverAddr.sin_port = htons(8081);

    // Attempt to connect
    int connectResult = connect(clientSocket, (struct sockaddr*)&serverAddr, sizeof(serverAddr));
    EXPECT_EQ(connectResult, 0);

    // Close the connection
    close(clientSocket);

    // Stop the server
    server->stop();

    // Wait for server thread to finish
    if (serverThread.joinable()) {
        serverThread.join();
    }
}
