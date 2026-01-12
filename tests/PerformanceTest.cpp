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
#include <algorithm>
#include <mutex>
#include <random>
#include <iomanip>

// ============================================================================
// Configuration & Globals
// ============================================================================
std::string get_env_var(std::string const & key) {
    char * val = getenv( key.c_str() );
    return val == NULL ? std::string("") : std::string(val);
}

std::string SERVER_IP = "127.0.0.1";
const int SERVER_PORT = 5555;
const int TARGET_REQUESTS = 10000;
const int NUM_THREADS = 50;

std::atomic<int> successCount(0);
std::atomic<int> failureCount(0);
std::atomic<int> connectionErrors(0);
std::atomic<int> responseErrors(0);

// Track response types for detailed analysis
std::atomic<int> response200(0);
std::atomic<int> response201(0);
std::atomic<int> response204(0);
std::atomic<int> response400(0);
std::atomic<int> response404(0);

std::mutex latencyMutex;
std::vector<double> allLatencies;

// ============================================================================
// Protocol Helper Functions
// ============================================================================

// Generate variety of test commands matching the C++ server protocol
std::vector<std::string> getTestCommands() {
    std::vector<std::string> commands;
    
    // POST commands FIRST to create users/movies
    // POST <userId> <movieId1> <movieId2> ...
    for (int i = 1; i <= 20; i++) {
        // Create user with multiple movies
        std::string cmd = "POST " + std::to_string(i);
        for (int j = 1; j <= 10; j++) {
            cmd += " " + std::to_string((i * 10) + j);
        }
        cmd += "\n";
        commands.push_back(cmd);
    }
    
    // GET commands: GET <userId> <movieId>
    for (int i = 1; i <= 20; i++) {
        for (int j = 1; j <= 10; j++) {
            commands.push_back("GET " + std::to_string(i) + " " + std::to_string((i * 10) + j) + "\n");
        }
    }
    
    return commands;
}

// Create a socket connection to the server
int createConnection(const std::string& ip, int port) {
    struct addrinfo hints, *res;
    memset(&hints, 0, sizeof hints);
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;

    if (getaddrinfo(ip.c_str(), std::to_string(port).c_str(), &hints, &res) != 0) {
        return -1;
    }

    int sock = socket(res->ai_family, res->ai_socktype, res->ai_protocol);
    if (sock < 0) {
        freeaddrinfo(res);
        return -1;
    }

    if (connect(sock, res->ai_addr, res->ai_addrlen) < 0) {
        close(sock);
        freeaddrinfo(res);
        return -1;
    }

    freeaddrinfo(res);
    return sock;
}

// Read complete response from server (may be multi-line)
std::string readResponse(int sock) {
    char buffer[4096] = {0};
    std::string response;
    
    // Read with timeout
    struct timeval tv;
    tv.tv_sec = 2;
    tv.tv_usec = 0;
    setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, (const char*)&tv, sizeof tv);
    
    int valread = read(sock, buffer, sizeof(buffer) - 1);
    if (valread > 0) {
        buffer[valread] = '\0';
        response = std::string(buffer);
    }
    
    return response;
}

// Validate response format according to protocol
bool isValidResponse(const std::string& response) {
    if (response.empty()) {
        return false;
    }
    
    // Responses should end with newline
    if (response.back() != '\n') {
        return false;
    }
    
    // Check if it starts with a valid status code
    if (response.find("200") == 0 || response.find("201") == 0 || 
        response.find("204") == 0 || response.find("400") == 0 || 
        response.find("404") == 0) {
        return true;
    }
    
    return false;
}

// Check if response indicates success
bool isSuccessResponse(const std::string& response) {
    return response.find("200") == 0 || response.find("201") == 0 || response.find("204") == 0;
}

// ============================================================================
// Worker thread - persistent connection mode
// ============================================================================
void clientTaskPersistent(int requestsPerThread, int threadId) {
    std::vector<double> localLatencies;
    localLatencies.reserve(requestsPerThread);
    
    auto commands = getTestCommands();
    std::mt19937 rng(threadId);
    std::uniform_int_distribution<int> dist(0, commands.size() - 1);

    // Create one persistent connection
    int sock = createConnection(SERVER_IP, SERVER_PORT);
    if (sock < 0) {
        connectionErrors += requestsPerThread;
        failureCount += requestsPerThread;
        return;
    }

    for (int i = 0; i < requestsPerThread; ++i) {
        auto reqStart = std::chrono::high_resolution_clock::now();
        
        std::string command = commands[dist(rng)];
        ssize_t sent = send(sock, command.c_str(), command.length(), 0);
        
        if (sent <= 0) {
            failureCount++;
            connectionErrors++;
            break; // Connection broken
        }
        
        std::string response = readResponse(sock);
        
        auto reqEnd = std::chrono::high_resolution_clock::now();
        double latencyMs = std::chrono::duration<double, std::milli>(reqEnd - reqStart).count();
        
        if (response.empty()) {
            failureCount++;
            connectionErrors++;
            break; // Connection broken
        } else if (!isValidResponse(response)) {
            failureCount++;
            responseErrors++;
        } else {
            // Any valid protocol response counts as success for throughput
            successCount++;
            localLatencies.push_back(latencyMs);
            
            // Track response types
            if (response.find("200") == 0) response200++;
            else if (response.find("201") == 0) response201++;
            else if (response.find("204") == 0) response204++;
            else if (response.find("400") == 0) response400++;
            else if (response.find("404") == 0) response404++;
        }
    }
    
    close(sock);
    
    // Merge local latencies into global
    if (!localLatencies.empty()) {
        std::lock_guard<std::mutex> lock(latencyMutex);
        allLatencies.insert(allLatencies.end(), localLatencies.begin(), localLatencies.end());
    }
}

// ============================================================================
// Worker thread - new connection per request mode
// ============================================================================
void clientTaskNewConnection(int requestsPerThread, int threadId) {
    std::vector<double> localLatencies;
    localLatencies.reserve(requestsPerThread);
    
    auto commands = getTestCommands();
    // Create random number with ThreadID as seed 
    std::mt19937 rng(threadId);
    std::uniform_int_distribution<int> dist(0, commands.size() - 1);

    for (int i = 0; i < requestsPerThread; ++i) {
        auto reqStart = std::chrono::high_resolution_clock::now();
        
        int sock = createConnection(SERVER_IP, SERVER_PORT);
        if (sock < 0) {
            connectionErrors++;
            failureCount++;
            continue;
        }

        std::string command = commands[dist(rng)];
        ssize_t sent = send(sock, command.c_str(), command.length(), 0);
        
        if (sent <= 0) {
            failureCount++;
            connectionErrors++;
            close(sock);
            continue;
        }
        
        std::string response = readResponse(sock);
        close(sock);
        
        auto reqEnd = std::chrono::high_resolution_clock::now();
        double latencyMs = std::chrono::duration<double, std::milli>(reqEnd - reqStart).count();
        
        if (response.empty()) {
            failureCount++;
            connectionErrors++;
        } else if (!isValidResponse(response)) {
            failureCount++;
            responseErrors++;
        } else {
            // Any valid protocol response counts as success for throughput
            successCount++;
            localLatencies.push_back(latencyMs);
            
            // Track response types
            if (response.find("200") == 0) response200++;
            else if (response.find("201") == 0) response201++;
            else if (response.find("204") == 0) response204++;
            else if (response.find("400") == 0) response400++;
            else if (response.find("404") == 0) response404++;
        }
    }
    
    // Merge local latencies into global
    if (!localLatencies.empty()) {
        std::lock_guard<std::mutex> lock(latencyMutex);
        allLatencies.insert(allLatencies.end(), localLatencies.begin(), localLatencies.end());
    }
}

// ============================================================================
// Statistics calculation
// ============================================================================
void printLatencyStats() {
    if (allLatencies.empty()) {
        std::cout << "No latency data available." << std::endl;
        return;
    }
    
    std::sort(allLatencies.begin(), allLatencies.end());
    
    double min = allLatencies.front();
    double max = allLatencies.back();
    
    double sum = 0;
    for (double lat : allLatencies) {
        sum += lat;
    }
    double avg = sum / allLatencies.size();
    
    double p50 = allLatencies[allLatencies.size() * 50 / 100];
    double p95 = allLatencies[allLatencies.size() * 95 / 100];
    double p99 = allLatencies[allLatencies.size() * 99 / 100];
    
    std::cout << "\n=== Latency Statistics (ms) ===" << std::endl;
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "Min:    " << min << " ms" << std::endl;
    std::cout << "Avg:    " << avg << " ms" << std::endl;
    std::cout << "Max:    " << max << " ms" << std::endl;
    std::cout << "p50:    " << p50 << " ms" << std::endl;
    std::cout << "p95:    " << p95 << " ms" << std::endl;
    std::cout << "p99:    " << p99 << " ms" << std::endl;
}

// ============================================================================
// Main
// ============================================================================
int main(int argc, char const *argv[]) {
    std::string env_ip = get_env_var("SERVER_IP");
    if (!env_ip.empty()) {
        SERVER_IP = env_ip;
    }

    int totalRequests = TARGET_REQUESTS;
    bool usePersistentConnections = true; // default mode
    
    // Parse arguments
    for (int i = 1; i < argc; i++) {
        std::string arg = argv[i];
        if (arg == "--new-connection") {
            usePersistentConnections = false;
        } else if (arg == "--persistent") {
            usePersistentConnections = true;
        } else {
            totalRequests = std::stoi(arg);
        }
    }
    
    std::cout << "========================================" << std::endl;
    std::cout << "  C++ Recommendation Server Performance Test" << std::endl;
    std::cout << "========================================" << std::endl;
    std::cout << "Server:           " << SERVER_IP << ":" << SERVER_PORT << std::endl;
    std::cout << "Target Requests:  " << totalRequests << std::endl;
    std::cout << "Threads:          " << NUM_THREADS << std::endl;
    std::cout << "Connection Mode:  " << (usePersistentConnections ? "Persistent" : "New per request") << std::endl;
    std::cout << "========================================" << std::endl;

    auto start_time = std::chrono::high_resolution_clock::now();

    std::vector<std::thread> threads;
    int requestsPerThread = totalRequests / NUM_THREADS;

    for (int i = 0; i < NUM_THREADS; ++i) {
        if (usePersistentConnections) {
            threads.emplace_back(clientTaskPersistent, requestsPerThread, i);
        } else {
            threads.emplace_back(clientTaskNewConnection, requestsPerThread, i);
        }
    }

    for (auto& t : threads) {
        t.join();
    }

    auto end_time = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double> diff = end_time - start_time;

    std::cout << "\n========================================" << std::endl;
    std::cout << "  Test Results" << std::endl;
    std::cout << "========================================" << std::endl;
    std::cout << "Time Taken:           " << std::fixed << std::setprecision(2) << diff.count() << " seconds" << std::endl;
    std::cout << "Successful Requests:  " << successCount.load() << std::endl;
    std::cout << "Failed Requests:      " << failureCount.load() << std::endl;
    std::cout << "  - Connection Errors: " << connectionErrors.load() << std::endl;
    std::cout << "  - Response Errors:   " << responseErrors.load() << std::endl;
    std::cout << "Throughput:           " << (successCount.load() / diff.count()) << " req/sec" << std::endl;
    
    // Response type breakdown
    std::cout << "\n=== Response Type Breakdown ===" << std::endl;
    std::cout << "200 OK:            " << response200.load() << " (recommendations returned)" << std::endl;
    std::cout << "201 Created:       " << response201.load() << " (users created)" << std::endl;
    std::cout << "204 No Content:    " << response204.load() << " (updates/deletes)" << std::endl;
    std::cout << "400 Bad Request:   " << response400.load() << std::endl;
    std::cout << "404 Not Found:     " << response404.load() << std::endl;
    
    printLatencyStats();
    
    std::cout << "========================================" << std::endl;

    return 0;
}