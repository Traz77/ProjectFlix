#include <iostream>
#include <vector>
#include <thread>
#include <atomic>
#include <chrono>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <cstring>
#include <sstream>
#include <netdb.h>

// Simple configuration
std::string get_env_var(std::string const & key) {
    char * val = getenv( key.c_str() );
    return val == NULL ? std::string("") : std::string(val);
}

std::string SERVER_IP = "127.0.0.1";
const int SERVER_PORT = 5555; // Default port
const int TARGET_REQUESTS = 10000; // Total requests
const int NUM_THREADS = 50; // Concurrency

std::atomic<int> successCount(0);
std::atomic<int> failureCount(0);

void clientTask(int requestsPerThread) {
    int sock = 0;
    struct sockaddr_in serv_addr;
    char buffer[1024] = {0};

    struct addrinfo hints, *res;
    memset(&hints, 0, sizeof hints);
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;

    if (getaddrinfo(SERVER_IP.c_str(), std::to_string(SERVER_PORT).c_str(), &hints, &res) != 0) {
        failureCount += requestsPerThread;
        return;
    }

    // Create socket
    if ((sock = socket(res->ai_family, res->ai_socktype, res->ai_protocol)) < 0) {
        failureCount += requestsPerThread;
        freeaddrinfo(res);
        return;
    }

    if (connect(sock, res->ai_addr, res->ai_addrlen) < 0) {
        failureCount += requestsPerThread;
        close(sock);
        freeaddrinfo(res);
        return;
    }

    freeaddrinfo(res);

    // Let's send requests
    for (int i = 0; i < requestsPerThread; ++i) {
        std::string command = "GET 1 100"; // Recommend for User 1 based on Movie 100
        send(sock, command.c_str(), command.length(), 0);
        
        // Wait for response
        int valread = read(sock, buffer, 1024);
        if (valread > 0) {
            successCount++;
        } else {
            failureCount++;
            // Reconnect if broken?
            break; 
        }
        memset(buffer, 0, 1024);
    }
    close(sock);
}

int main(int argc, char const *argv[]) {
    std::string env_ip = get_env_var("SERVER_IP");
    if (!env_ip.empty()) {
        SERVER_IP = env_ip;
    }

    int totalRequests = TARGET_REQUESTS;
    if (argc > 1) {
        totalRequests = std::stoi(argv[1]);
    }
    
    std::cout << "Starting Performance Test..." << std::endl;
    std::cout << "Target Requests: " << totalRequests << std::endl;
    std::cout << "Threads: " << NUM_THREADS << std::endl;

    auto start_time = std::chrono::high_resolution_clock::now();

    std::vector<std::thread> threads;
    int requestsPerThread = totalRequests / NUM_THREADS;

    for (int i = 0; i < NUM_THREADS; ++i) {
        threads.emplace_back(clientTask, requestsPerThread);
    }

    for (auto& t : threads) {
        t.join();
    }

    auto end_time = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double> diff = end_time - start_time;

    std::cout << "Test Completed." << std::endl;
    std::cout << "Time Taken: " << diff.count() << " seconds" << std::endl;
    std::cout << "Successful Requests: " << successCount.load() << std::endl;
    std::cout << "Failed Requests: " << failureCount.load() << std::endl;
    std::cout << "Throughput: " << (successCount.load() / diff.count()) << " req/sec" << std::endl;

    return 0;
}
