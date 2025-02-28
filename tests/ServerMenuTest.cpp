#include <gtest/gtest.h>
#include "ServerMenu.h"
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <thread>
#include <vector>
#include <string>

// Helper function to create a socket pair for testing
void createSocketPair(int& serverSocket, int& clientSocket) {
    int sockets[2];
    socketpair(AF_UNIX, SOCK_STREAM, 0, sockets);
    serverSocket = sockets[0];
    clientSocket = sockets[1];
}

// Test case for ServerMenu
TEST(ServerMenuTest, ValidInput) {
    int serverSocket, clientSocket;
    createSocketPair(serverSocket, clientSocket);

    ServerMenu menu(serverSocket);

    // Simulate client sending valid input
    std::string input = "GET 123 456\n";
    write(clientSocket, input.c_str(), input.size());

    std::vector<std::string> command = menu.nextCommand();

    ASSERT_EQ(command.size(), 3);
    EXPECT_EQ(command[0], "GET");
    EXPECT_EQ(command[1], "123");
    EXPECT_EQ(command[2], "456");

    std::string input2 = "POST 3 4 5\n";
    write(clientSocket, input2.c_str(), input2.size());
    std::vector<std::string> command2 = menu.nextCommand();

    ASSERT_EQ(command2.size(), 4);
    EXPECT_EQ(command2[0], "POST");
    EXPECT_EQ(command2[1], "3");
    EXPECT_EQ(command2[2], "4");
    EXPECT_EQ(command2[3], "5");

    std::string input3 = "DELETE 1 2 3 4\n";
    write(clientSocket, input3.c_str(), input3.size());
    std::vector<std::string> command3 = menu.nextCommand();

    ASSERT_EQ(command3.size(), 5);
    EXPECT_EQ(command3[0], "DELETE");
    EXPECT_EQ(command3[1], "1");
    EXPECT_EQ(command3[2], "2");
    EXPECT_EQ(command3[3], "3");
    EXPECT_EQ(command3[4], "4");

    std::string input4 = "PATCH 1 2 3 4 5\n";
    write(clientSocket, input4.c_str(), input4.size());
    std::vector<std::string> command4 = menu.nextCommand();

    ASSERT_EQ(command4.size(), 6);
    EXPECT_EQ(command4[0], "PATCH");
    EXPECT_EQ(command4[1], "1");
    EXPECT_EQ(command4[2], "2");
    EXPECT_EQ(command4[3], "3");
    EXPECT_EQ(command4[4], "4");
    EXPECT_EQ(command4[5], "5");

    std::string input5 = "help\n";
    write(clientSocket, input5.c_str(), input5.size());
    std::vector<std::string> command5 = menu.nextCommand();

    ASSERT_EQ(command5.size(), 1);
    EXPECT_EQ(command5[0], "help");

    close(serverSocket);
    close(clientSocket);
}

TEST(ServerMenuTest, InvalidInput) {
    int serverSocket, clientSocket;
    createSocketPair(serverSocket, clientSocket);

    ServerMenu menu(serverSocket);

    // Simulate client sending invalid input
    std::string input = "GET 123 @456\n";
    write(clientSocket, input.c_str(), input.size());
    std::vector<std::string> command = menu.nextCommand();
    ASSERT_TRUE(command.empty());

    std::string input2 = "POST";
    write(clientSocket, input2.c_str(), input2.size());
    std::vector<std::string> command2 = menu.nextCommand();
    ASSERT_TRUE(command2.empty());

    std::string input3 = "help 123\n";
    write(clientSocket, input3.c_str(), input3.size());
    std::vector<std::string> command3 = menu.nextCommand();
    ASSERT_TRUE(command3.empty());

    std::string input4 = "DELETE 1\n";
    write(clientSocket, input4.c_str(), input4.size());
    std::vector<std::string> command4 = menu.nextCommand();
    ASSERT_TRUE(command4.empty());

    std::string input5 = "PATCH 1\n";
    write(clientSocket, input5.c_str(), input5.size());
    std::vector<std::string> command5 = menu.nextCommand();
    ASSERT_TRUE(command5.empty());

    std::string input6 = "GET 1 2 3 4\n";
    write(clientSocket, input6.c_str(), input6.size());
    std::vector<std::string> command6 = menu.nextCommand();
    ASSERT_TRUE(command6.empty());

    std::string input7 = "POST 1 2 3 d\n";
    write(clientSocket, input7.c_str(), input7.size());
    std::vector<std::string> command7 = menu.nextCommand();
    ASSERT_TRUE(command7.empty());

    close(serverSocket);
    close(clientSocket);
}

TEST(ServerMenuTest, SendMessageToClient) {
    int serverSocket, clientSocket;
    createSocketPair(serverSocket, clientSocket);

    ServerMenu menu(serverSocket);

    // Simulate sending a message to the client
    std::string message = "400 Bad Request\0"; 
    menu.displayMessage(message);

    // Read message on client side
    char buffer[1024] = {0};
    int bytesRead = read(clientSocket, buffer, sizeof(buffer));
    ASSERT_GT(bytesRead, 0);
    std::string receivedMessage(buffer, bytesRead);
    EXPECT_EQ(receivedMessage, std::string(message.c_str(),message.size()+1));
 
    close(serverSocket);
    close(clientSocket);
}