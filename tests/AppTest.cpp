#include "App.h"
#include <iostream>
#include <map>
#include <gtest/gtest.h>

// creating an interface IMenu demo to test app 
class IMenuDemo {
public:
    virtual ~IMenuDemo() = default;
    virtual void displayMenu() = 0;
    virtual void nextCommand() = 0;
};

// creating an interface ICommand demo to test app 
class ICommandDemo {
public:
    virtual ~ICommandDemo() = default;
    virtual void execute() = 0;
};

// creating a menu that has 2 basic functions 
class demoMenu : public IMenuDemo {
public:
    void displayMenu() {
        std::cout << "displaying" << std::endl;
    }
    void nextCommand() {
        std::cout << "next command" << std::endl;
    }
};

// creating a help class that implements execute 
class demoHelp : public ICommandDemo {
public:
    void execute() {
        std::cout << "use help" <<std::endl;
    }
};

// creating the variables needed to initiate App 
class AppTest : public ::testing::Test{
    public:
        demoMenu* demoM;
        demoHelp* displayHelp;
        // hashmap that will be sent to app 
        std::map<std::string, ICommandDemo*> commandsMap;
        App* app;

    // setup for the test
    void SetUp() {
        demoM = new demoMenu();
        displayHelp = new demoHelp();
        commandsMap["1"] = displayHelp;
        app = new App(demoM, commandsMap);
    }

    //remove after the test
    void TearDown() {
        delete demoM;
        delete displayHelp;
        delete app;
    }
};

//check the validation of constructor 
TEST_F(AppTest, checkConstructor) {
    EXPECT_NO_THROW(App appTest(demoM, commandsMap));
}
// check that using run doesn't crush the class 
TEST_F(AppTest, doesNotCrush) {
    EXPECT_NO_THROW(app->run());
}

