cmake_minimum_required(VERSION 3.14)

project(my_project)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_FLAGS "-O3 ")
set(CMAKE_CXX_STANDARD_REQUIRED True)

option(ENABLE_COVERAGE "Enable coverage" OFF)
if(ENABLE_COVERAGE)
    add_compile_options(--coverage)
    add_link_options(--coverage)
endif()

include(FetchContent)
find_package(GTest QUIET)
if(NOT GTest_FOUND)
    FetchContent_Declare(
      googletest
      URL https://github.com/google/googletest/archive/03597a01ee50ed33e9dfd640b249b4be3799d395.zip
      DOWNLOAD_EXTRACT_TIMESTAMP TRUE
    )

    set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
    FetchContent_MakeAvailable(googletest)
endif()
#include headers dir
include_directories(${PROJECT_SOURCE_DIR}/headers)


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
if(TARGET GTest::gtest_main)
  target_link_libraries(runTests PRIVATE GTest::gtest_main)
else()
  target_link_libraries(runTests PRIVATE gtest_main)
endif()
enable_testing()
include(GoogleTest)
add_test(NAME RunTests COMMAND runTests)
gtest_discover_tests(runTests)

add_executable(benchmark tests/PerformanceTest.cpp)
target_link_libraries(benchmark pthread) 
