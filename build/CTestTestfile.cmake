# CMake generated Testfile for 
# Source directory: /mnt/c/Users/talra/ProjectFlix-1
# Build directory: /mnt/c/Users/talra/ProjectFlix-1/build
# 
# This file includes the relevant testing commands required for 
# testing this directory and lists subdirectories to be tested as well.
include("/mnt/c/Users/talra/ProjectFlix-1/build/runTests[1]_include.cmake")
add_test(RunTests "tests")
set_tests_properties(RunTests PROPERTIES  _BACKTRACE_TRIPLES "/mnt/c/Users/talra/ProjectFlix-1/CMakeLists.txt;90;add_test;/mnt/c/Users/talra/ProjectFlix-1/CMakeLists.txt;0;")
subdirs("_deps/googletest-build")
