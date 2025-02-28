#ifndef THREAD_POOL_MANAGER_H
#define THREAD_POOL_MANAGER_H

#include "IThreadManager.h"

#include <thread>
#include <queue>
#include <vector>
#include <functional>
#include <mutex>
#include <condition_variable>
#include <atomic>
#include <memory>

class ThreadPoolManager : public IThreadManager {
public:
    // Constructor that denys implicit convertions 
    explicit ThreadPoolManager(size_t threadCount);

    // Destructor 
    ~ThreadPoolManager() override;

    // add a task to the thread pool
    void execute(std::function<void()> task) override;

private:
    // store worker threads
    std::vector<std::thread> threads;

    // store tasks
    std::queue<std::function<void()>> tasks;

    // protect the task queue from couple of threads entering the same task
    mutable std::mutex queueMutex;

    // notify worker threads
    std::condition_variable condition;

    // indicate if thread pool is stopping
    std::atomic<bool> stopFlag;
};

#endif 
