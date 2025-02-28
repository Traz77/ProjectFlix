#ifndef CLIENTHANDLER_H
#define CLIENTHANDLER_H

#include "App.h"
#include "ServerMenu.h"
#include "IThreadManager.h"
#include "Filestream.h"
#include "ServerMenu.h"
#include "App.h"
#include "Help.h"
#include "Recommend.h"
#include "Patch.h"
#include "Post.h"
#include "Get.h"
#include "Delete.h"
#include "ICommand.h"

#include <thread>
#include <iostream>
#include <stdexcept>
#include <unistd.h>

class ClientHandler {
public:  
    ClientHandler(int clientSocket, IThreadManager* threadManager); 

    void start();

    void join();

    IThreadManager* threadManager;

private:
    void handleClient();

    int clientSocket;

    std::thread workerThread;
};

#endif 