#ifndef GET_H
#define GET_H

#include "ICommand.h"
#include "Recommend.h"
#include "IServer.h"
#include "Data.h"

#include <vector>
#include <string>

class Get : public ICommand {
private:
    ICommand* recommend;

public:
    Get ();
    ~Get() { delete recommend; }  // Clean up allocated memory

    void execute(std::vector<std::string> args, std::ostream& response) override;

    std::string toString() const override;

    ICommand* getCommand();
};

#endif


