#include "SimpleThreadManager.h"

// Ensures all threads are properly joined before destruction
SimpleThreadManager::~SimpleThreadManager() {
    for (std::thread& t : threads) {
        if (t.joinable()) {
            t.join(); 
        }
    }
}

// Execute a new task in a separate thread
void SimpleThreadManager::execute(std::function<void()> task) {

    // Ensure thread-safe access
    std::lock_guard<std::mutex> lock(mtx); 

    // Create and add new thread
    threads.emplace_back(std::thread(task)); 
}
