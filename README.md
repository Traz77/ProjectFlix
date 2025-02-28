# Project-Ex4
## Description

Welcome to our ProjectFlix! 

Our workflow began with developing a C++ server that manages users, their watch history, and provides a reccomendation system based on similarity to other users and their preferences. 
Then, we made a Node.JS server in MVC structure that store the movie and category objects, devides them, acts as a bridge to the recommendation system and store data in MongoDB - allowing CRUD operations. 
At last, we created React Frontend and an Android app for the clients, to use the application accross platforms. 

There are documentations and pictures in the Wiki folder. 

Our Jira site: 
https://henamar.atlassian.net/jira/software/projects/PE/boards/2/timeline

How to run the program: 
Clone repository from - https://github.com/chenamar7/Project-Ex3.git

Also, please include a config folder under webServer folder  (webServer/config)
Inside the folder please open a file .env.local (webServer/config/.env.local)
in the file please include

PORT=XXXX // [(3000 for example) for the NodeJS Server]

REACT_APP_API_URL=http://localhost:XXXX/   (XXXX = this should be the same as PORT)

RECOMMENDATION_PORT=XXXX // [(5555 for exmaple) for the CPP server]

FRONTEND_PORT=XXXX // [(3001 for example) -> the app will run on http://localhost:XXXX/]

CONNECTION_STRING=mongodb://host.docker.internal:27017 // (this will opearate on the local host)

JWT_SECRET=XXXX // (Generate the Token with this command - node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
and paste it.)

**reach in the internet to the frontend port  http://localhost:XXXX/login

Using docker commands (in the the main folder): 

docker-compose --env-file .\webServer\config\.env.local build (for PowerShell)
docker-compose --env-file ./webServer/config/.env.local build (for Unix)

docker-compose --env-file .\webServer\config\.env.local up -d (for PowerShell)
docker-compose --env-file ./webServer/config/.env.local up -d (for Unix)

If you want to run the tests for the cpp server please run the command

docker-compose --env-file .\webServer\config\.env.local run --rm cpp_server ./runTests

- To make yourself Admin: 
docker exec -it mongo mongosh (make sure you are in the mongoDB database terminal after this command)
db.users.updateOne( { email: "XXXX@example.com" }, { $set: { role: "admin" } } )


To run the android app: 

On android studio

Press File -> New -> Project From Version Control -> Insert the URL https://github.com/chenamar7/Project-Ex4.git

Then Press File -> Open -> choose android -> Sync with Gradle, use R language and run 

**Please Note - The base url of the android is in port 3000 (http://10.0.2.2:3000/api/) this should match the backend port.
**If you decide to change the backend port (PORT), please go in android -> res -> values -> strings.xml -> change the last string called api_url to the port you chose for the backend NodeJS

