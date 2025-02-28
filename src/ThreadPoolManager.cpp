#include "ThreadPoolManager.h"
#include <stdexcept>
#include <iostream>

// notify thread pool is running 
ThreadPoolManager::ThreadPoolManager(size_t threadCount) : stopFlag(false) {
    for (size_t i = 0; i < threadCount; ++i) {
        // Add a thread 
        threads.emplace_back([this] {
            while (true) {
                std::function<void()> task;
                // Scope for lock
                {
                    // Lock task
                    std::unique_lock<std::mutex> lock(this->queueMutex);

                    // Wait for the task to finish
                    this->condition.wait(lock, [this] {
                        // When task finished, return
                        return this->stopFlag || !this->tasks.empty();
                    });

                    // Recheck the condition it waits on     
                    if (this->stopFlag && this->tasks.empty()) {
                        return;
                    }

                    // Put the next task to work, and remove from queue 
                    task = std::move(this->tasks.front());
                    this->tasks.pop();
                }

                // Execute the task
                task();
            }
        });
    }
}

// Destructor - ensures all threads finished and exit them  
ThreadPoolManager::~ThreadPoolManager() {
    {
        std::unique_lock<std::mutex> lock(queueMutex);
        stopFlag = true;
    }
    condition.notify_all();
    for (std::thread &t : threads) {
        t.join();
    }
}

// Add a task to the thread pool
void ThreadPoolManager::execute(std::function<void()> task) {
    {   
        std::unique_lock<std::mutex> lock(queueMutex);

        // Thread pool stopped
        if (stopFlag) {
            throw std::runtime_error("ThreadPoolManager is stopped");
        }
        // Add to queue 
        tasks.emplace(std::move(task));
    }
    // Tell the thread a task needs to be processed 
    condition.notify_one();
}