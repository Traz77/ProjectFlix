#ifndef FILESTREAM_H
#define FILESTREAM_H

#include "User.h"
#include "Movie.h"
#include "Data.h"
#include "Add.h"
#include <mutex>
#include <IStreamable.h>
#include <fstream>
#include <vector>
#include <sstream>
#include <stdexcept>

class FileStream : public IStreamable {
private:
    std::string filename;
    std::mutex fileMutex;

public:
    // Default constructor
    FileStream() : FileStream("/usr/src/myapp/data/SaveData") {} 

    // Constructor that takes a filename, the constructor has a default value if send without a filename 
    FileStream(const std::string& fname);

    // Write a single user to the file
    void write(const User& user);

    // Read all users from the file
    std::vector<User> read();

    // Retrieve all data on proggram start
    void initiate();

    // Update movies for a specific user in the file 
    void updateMovies(const User& updatedUser, std::vector<Movie>);
};

#endif 