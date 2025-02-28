#ifndef ISERVER_H
#define ISERVER_H

#include <string>
#include <vector>

class IServer {
public:
    virtual ~IServer() = default;

    virtual void start() = 0;
    
    virtual void stop() = 0;
};

#endif // ISERVER_H