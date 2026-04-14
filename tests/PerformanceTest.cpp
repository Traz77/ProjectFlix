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
#include <netinet/tcp.h>

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
std::atomic<int> response500(0);

std::mutex latencyMutex;
std::vector<double> allLatencies;

using BenchmarkClock = std::chrono::steady_clock;

// ============================================================================
// Protocol Helper Functions
// ============================================================================

// Generate POST commands to seed users with movies
std::vector<std::string> getSeedCommands() {
    std::vector<std::string> commands;
    for (int i = 1; i <= 20; i++) {
        std::string cmd = "POST " + std::to_string(i);
        for (int j = 1; j <= 10; j++) {
            cmd += " " + std::to_string((i * 10) + j);
        }
        cmd += "\n";
        commands.push_back(cmd);
    }
    return commands;
}

// Generate mixed commands for realistic server benchmarking (78% GET, 2% POST, 20% PATCH)
std::vector<std::string> getBenchmarkCommands() {
    std::vector<std::string> commands;
    for (int i = 1; i <= 20; i++) {
        // Generate 100 commands per user loop to maintain exact ratios
        
        // 78% GET requests 
        for (int j = 0; j < 78; j++) {
            int randomMovie = (i * 10) + (j % 10) + 1; // Existing movie range
            commands.push_back("GET " + std::to_string(i) + " " + std::to_string(randomMovie) + "\n");
        }
        
        // 2% POST requests (Add new users/movies)
        for (int j = 0; j < 2; j++) {
            int newMovie = (i * 10) + j + 1000;
            commands.push_back("POST " + std::to_string(i) + " " + std::to_string(newMovie) + "\n");
        }
        
        // 20% PATCH requests (Update existing users with more movies)
        for (int j = 0; j < 20; j++) {
            int patchMovie = (i * 10) + j + 2000;
            commands.push_back("PATCH " + std::to_string(i) + " " + std::to_string(patchMovie) + "\n");
        }
    }
    return commands;
}

// Create a socket connection to the server with optimized settings
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

    int flag = 1;
    setsockopt(sock, IPPROTO_TCP, TCP_NODELAY, &flag, sizeof(flag));

    struct timeval tv;
    tv.tv_sec = 2;
    tv.tv_usec = 0; // 2s
    setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, (const char*)&tv, sizeof tv);

    if (connect(sock, res->ai_addr, res->ai_addrlen) < 0) {
        close(sock);
        freeaddrinfo(res);
        return -1;
    }

    freeaddrinfo(res);
    return sock;
}

int createConnectionWithRetry(const std::string& ip, int port, int retries = 5) {
    for (int attempt = 0; attempt < retries; ++attempt) {
        int sock = createConnection(ip, port);
        if (sock >= 0) {
            return sock;
        }

        // Small backoff smooths out startup spikes when many threads connect at once.
        std::this_thread::sleep_for(std::chrono::milliseconds(20));
    }

    return -1;
}

// Buffered reader for proper TCP stream framing.
// The server protocol: responses start with a status code line.
// GET 200 responses have a second line (recommendations).
// All other responses are single-line.
class ConnectionReader {
public:
    ConnectionReader(int sock) : sock(sock) {}
    
    // Read one complete protocol response
    std::string readResponse() {
        // Read the first line (status line)
        std::string statusLine = readLine();
        if (statusLine.empty()) return "";
        
        std::string fullResponse = statusLine;
        
        // If it's "200 OK", read the second line (recommendations)
        if (statusLine.find("200 OK") == 0) {
            std::string dataLine = readLine();
            if (!dataLine.empty()) {
                fullResponse += dataLine;
            }
        }
        
        return fullResponse;
    }

private:
    int sock;
    std::string buffer;
    
    // Read one newline-terminated line from the buffered stream
    std::string readLine() {
        while (true) {
            // Check if we already have a complete line in the buffer
            size_t nlPos = buffer.find('\n');
            if (nlPos != std::string::npos) {
                std::string line = buffer.substr(0, nlPos + 1);
                buffer.erase(0, nlPos + 1);
                return line;
            }
            
            // Need more data
            char buf[4096];
            int valread = read(sock, buf, sizeof(buf));
            if (valread <= 0) {
                return ""; // timeout or error
            }
            buffer.append(buf, valread);
        }
    }
};

// Validate response format according to protocol
bool isValidResponse(const std::string& response) {
    if (response.empty()) {
        return false;
    }
    
    if (response.back() != '\n') {
        return false;
    }
    
    if (response.find("200") == 0 || response.find("201") == 0 || 
        response.find("204") == 0 || response.find("400") == 0 || 
        response.find("404") == 0 || response.find("500") == 0) {
        return true;
    }
    
    return false;
}

// ============================================================================
// Seeding phase - send POSTs to create test data (untimed)
// ============================================================================
void seedData() {
    auto commands = getSeedCommands();
    
    int sock = createConnectionWithRetry(SERVER_IP, SERVER_PORT);
    if (sock < 0) {
        std::cerr << "Failed to connect for seeding!" << std::endl;
        return;
    }

    ConnectionReader reader(sock);
    int seeded = 0;
    for (const auto& cmd : commands) {
        ssize_t sent = send(sock, cmd.c_str(), cmd.length(), 0);
        if (sent <= 0) {
            std::cerr << "Seed send failed" << std::endl;
            break;
        }
        
        std::string response = reader.readResponse();
        if (!response.empty()) {
            seeded++;
        }
    }
    
    close(sock);
    std::cout << "Seeded " << seeded << " users with movies." << std::endl;
}

// ============================================================================
// Worker thread - persistent connection benchmark
// ============================================================================
void clientTaskPersistent(int requestsPerThread, int threadId) {
    std::vector<double> localLatencies;
    localLatencies.reserve(requestsPerThread);
    
    auto commands = getBenchmarkCommands();
    std::mt19937 rng(threadId);
    std::uniform_int_distribution<int> dist(0, commands.size() - 1);

    // Create one persistent connection
    int sock = createConnectionWithRetry(SERVER_IP, SERVER_PORT);
    if (sock < 0) {
        connectionErrors += requestsPerThread;
        failureCount += requestsPerThread;
        return;
    }

    ConnectionReader reader(sock);

    for (int i = 0; i < requestsPerThread; ++i) {
        auto reqStart = BenchmarkClock::now();
        
        std::string command = commands[dist(rng)];
        ssize_t sent = send(sock, command.c_str(), command.length(), 0);
        
        if (sent <= 0) {
            failureCount++;
            connectionErrors++;

            // Mark all remaining requests for this worker as failed due to broken socket.
            int remaining = requestsPerThread - (i + 1);
            if (remaining > 0) {
                failureCount += remaining;
                connectionErrors += remaining;
            }
            break; // Connection broken
        }
        
        std::string response = reader.readResponse();
        
        auto reqEnd = BenchmarkClock::now();
        double latencyMs = std::chrono::duration<double, std::milli>(reqEnd - reqStart).count();
        
        if (response.empty()) {
            failureCount++;
            connectionErrors++;

            // Mark all remaining requests for this worker as failed due to broken socket.
            int remaining = requestsPerThread - (i + 1);
            if (remaining > 0) {
                failureCount += remaining;
                connectionErrors += remaining;
            }
            break; // Connection broken
        } else if (!isValidResponse(response)) {
            failureCount++;
            responseErrors++;
            
            if (responseErrors.load() <= 3) {
                std::lock_guard<std::mutex> lock(latencyMutex);
                std::cerr << "[Thread " << threadId << "] Bad response: '" 
                          << response.substr(0, 80) << "'" << std::endl;
            }
        } else {
            successCount++;
            localLatencies.push_back(latencyMs);
            
            // Track response types
            if (response.find("200") == 0) response200++;
            else if (response.find("201") == 0) response201++;
            else if (response.find("204") == 0) response204++;
            else if (response.find("400") == 0) response400++;
            else if (response.find("404") == 0) response404++;
            else if (response.find("500") == 0) {
                int count = response500.fetch_add(1);
                if (count < 3) {
                    std::lock_guard<std::mutex> lock(latencyMutex);
                    std::cerr << "[Thread " << threadId << "] Server Exception: " 
                              << response << std::endl;
                }
            }
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
    
    // Parse arguments
    for (int i = 1; i < argc; i++) {
        std::string arg = argv[i];
        totalRequests = std::stoi(arg);
    }
    
    std::cout << "========================================" << std::endl;
    std::cout << "  C++ Recommendation Server Performance Test" << std::endl;
    std::cout << "========================================" << std::endl;
    std::cout << "Server:           " << SERVER_IP << ":" << SERVER_PORT << std::endl;
    std::cout << "Target Requests:  " << totalRequests << std::endl;
    std::cout << "Threads:          " << NUM_THREADS << std::endl;
    std::cout << "Connection Mode:  Persistent" << std::endl;
    std::cout << "========================================" << std::endl;

    // Phase 1: Seed data (untimed)
    std::cout << "\n--- Seeding test data ---" << std::endl;
    seedData();

    // Phase 2: Benchmark (timed)
    std::cout << "\n--- Running benchmark ---" << std::endl;
    
    auto start_time = BenchmarkClock::now();

    std::vector<std::thread> threads;
    int requestsPerThread = totalRequests / NUM_THREADS;
    int remainingRequests = totalRequests % NUM_THREADS;

    for (int i = 0; i < NUM_THREADS; ++i) {
        int threadRequests = requestsPerThread + (i < remainingRequests ? 1 : 0);
        if (threadRequests > 0) {
            threads.emplace_back(clientTaskPersistent, threadRequests, i);
        }
    }

    for (auto& t : threads) {
        t.join();
    }

    auto end_time = BenchmarkClock::now();
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
    std::cout << "500 Exception:     " << response500.load() << " (server errors)" << std::endl;
    
    printLatencyStats();
    
    std::cout << "========================================" << std::endl;

    return 0;
}