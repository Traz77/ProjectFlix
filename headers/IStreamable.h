#ifndef ISTREAMABLE_H
#define ISTREAMABLE_H

#include "User.h"
#include <vector>

class IStreamable {
public:
    // Destructor 
    virtual ~IStreamable() = default;

    // A method to write a user to somewhere 
    virtual void write(const User& user) = 0;

    // A method to read all users from somewhere 
    virtual std::vector<User> read() = 0;
};

#endif