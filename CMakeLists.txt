cmake_minimum_required(VERSION 3.14)

project(my_project)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED True)

include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/03597a01ee50ed33e9dfd640b249b4be3799d395.zip
)
#include headers dir
include_directories(${PROJECT_SOURCE_DIR}/headers)


set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# Add the main application
add_executable(myapp
    src/Main.cpp
    src/App.cpp
    src/Menu.cpp
    src/Data.cpp
    src/Add.cpp
    src/Recommend.cpp
    src/Help.cpp
    src/User.cpp
    src/Movie.cpp
    src/Filestream.cpp
    src/TCPServer.cpp 
    src/Client.py
    src/ClientHandler.cpp
    src/Get.cpp
    src/Post.cpp
    src/Patch.cpp
    src/Delete.cpp
    src/ServerMenu.cpp
    src/SimpleThreadManager.cpp
    src/ThreadPoolManager.cpp
)


# Include directories for the main application
target_include_directories(myapp PRIVATE src)


add_executable(runTests
src/App.cpp
src/Menu.cpp
src/Data.cpp
src/Add.cpp
src/Recommend.cpp
src/Help.cpp
src/User.cpp
src/Movie.cpp
src/Filestream.cpp
src/TCPServer.cpp 
src/Client.py
src/ClientHandler.cpp
src/Get.cpp
src/Post.cpp
src/Patch.cpp
src/Delete.cpp
src/ServerMenu.cpp
src/SimpleThreadManager.cpp
src/ThreadPoolManager.cpp

tests/GetTest.cpp
tests/PostTest.cpp
tests/DeleteTest.cpp
tests/MenuTest.cpp
tests/UserTest.cpp
tests/MovieTest.cpp
tests/AddTest.cpp
tests/RecommendTest.cpp
tests/MenuTest.cpp
tests/FilestreamTest.cpp
tests/HelpTest.cpp
tests/PatchTest.cpp
tests/TCPServerTest.cpp
tests/ServerMenuTest.cpp
)

target_include_directories(runTests PRIVATE src)
target_link_libraries(runTests gtest_main )
enable_testing()
include(GoogleTest)
add_test(NAME RunTests COMMAND tests)
gtest_discover_tests(runTests)
