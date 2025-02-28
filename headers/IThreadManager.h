#ifndef ITHREAD_MANAGER_H
#define ITHREAD_MANAGER_H

#include <functional>

class IThreadManager {
public:
    virtual ~IThreadManager() = default;

    //start of the mission 
    virtual void execute(std::function<void()> task) = 0;
};

#endif 