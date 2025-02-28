#include "ICommand.h"
#include "IServer.h"
#include "IStreamable.h"
#include "User.h"
#include "Data.h"
#include "Filestream.h"

class Delete : public ICommand {
private:
    IStreamable* fileStream;

public:
    Delete();
    
    // If specific place to write to is needed 
    Delete(IStreamable* fileStream);

    // Delete some movies of a given user 
    void execute(std::vector<std::string> args, std::ostream& response) override;

    std::string toString() const override;

    int checkValidCommand(std::vector<std::string> args);

};