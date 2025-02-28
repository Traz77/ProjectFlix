#ifndef SIMPLE_THREAD_MANAGER_H
#define SIMPLE_THREAD_MANAGER_H

#include "IThreadManager.h"
#include <thread>
#include <vector>
#include <mutex>
#include <functional>

class SimpleThreadManager : public IThreadManager {
private:
    // List of threads to manage created threads
    std::vector<std::thread> threads; 

    // Mutex for synchronizing access to the thread list
    std::mutex mtx; 

public:
    // Ensures all threads are properly joined before destruction
    ~SimpleThreadManager() override;

    // Execute a new task in a separate thread
    void execute(std::function<void()> task) override;
};

#endif
