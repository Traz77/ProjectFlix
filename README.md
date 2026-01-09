# ProjectFlix

A cross-platform movie streaming platform built with modern technologies, featuring intelligent recommendation systems and multi-device support.

## Architecture

ProjectFlix implements a multi-tier architecture combining three core technologies:

**C++ Recommendation Engine**  
High-performance backend service managing user profiles, viewing history, and personalized content recommendations through advanced similarity algorithms.

**Node.js API Server**  
RESTful service layer implementing MVC architecture patterns, handling data persistence through MongoDB, and serving as the communication bridge between clients and the recommendation engine.

**Multi-Platform Clients**  
Web application built with React and native Android application providing consistent user experiences across desktop and mobile platforms.

Additional documentation and screenshots available in the [Wiki](wiki/) directory.

## Project Structure
```
ProjectFlix/
├── client/                              # React web application 
│   ├── src/                             
│   │   ├── components/                  
│   │   ├── services/   
│   │   └── ...            
├── webServer/                           # Node.js backend server (MVC)
│   ├── controllers/                     
│   │   ├── UserController.js            # User operations
│   │   ├── MovieController.js           # Movie management
│   │   ├── RecommendationController.js  # C++ engine integration
│   │   └── ...                          
│   ├── models/                          # Database schemas
│   │   ├── UserModel.js                 
│   │   ├── MovieModel.js                
│   │   └── ...                          
│   ├── routes/                          # API endpoints
│   │   ├── UserRoutes.js                
│   │   ├── MovieRoute.js                
│   │   └── ...                          
│   ├── middlewares/                     # Express middleware
│   │   ├── auth.js                      # Authentication middleware
│   │   └── upload.js                    # File upload handling
│   ├── services/                       
│   │   ├── UserServices.js              
│   │   ├── MovieService.js              
│   │   ├── RecommendationService.js     # C++ engine integration
│   │   └── ...                          
│   ├── config/                          # Configuration files
│   │   └── .env.local                   # Environment variables (create this - read instructions below)
│   └── app.js                           # Express application
├── src/                                 # C++ recommendation engine
│   ├── main.cpp                         
│   ├── MovieRecommender.cpp             # Recommendation algorithm
│   ├── TCPServer.cpp                    # TCP server entry point
│   ├── ThreadPoolManager.cpp            
│   └── ...                              
├── headers/                             # C++ header files
├── tests/                               # C++ unit tests
│   ├── UserManagerTest.cpp
│   ├── RecommendationTest.cpp
│   ├── ServerMenuTest.cpp
│   └── ...                              # Other test files
├── wiki/                                # Project documentation
├── docker-compose.yml                   # Multi-container orchestration
├── Dockerfile.client                    # React frontend container
├── CMakeLists.txt                       # C++ build configuration
└── README.md                            # Project documentation
```

### Technology Stack

- **Backend Services**: Node.js API server with MongoDB persistence
- **Recommendation Engine**: C++ service for content analysis and user profiling
- **Web Client**: React-based frontend application
- **Mobile Client**: Native Android application
- **Infrastructure**: Docker containerization and orchestration
- **Database**: MongoDB for data storage and management

### System Components

**API Layer**
- RESTful endpoints for client communication
- JWT-based authentication and authorization
- File upload and media handling
- Database abstraction and CRUD operations

**Recommendation Service**
- User behavior analysis and pattern recognition
- Content similarity algorithms
- Personalized recommendation generation
- Real-time preference learning

**Client Applications**
- Responsive web interface with modern UI components
- Native Android application with platform-specific optimizations
- Cross-platform state management and API integration

## Installation and Setup

### Prerequisites
- Docker and Docker Compose
- Git
- Android Studio (for mobile development)

### Initial Setup

**1. Repository Setup**
```bash
git clone https://github.com/omrinahum/ProjectFlix.git
cd ProjectFlix
```

**2. Environment Configuration**
Create the configuration directory and environment file:
```bash
mkdir -p webServer/config
```

Create `webServer/config/.env.local` with the following configuration:
```env
PORT=3000
REACT_APP_API_URL=http://localhost:3000/
RECOMMENDATION_PORT=5555
FRONTEND_PORT=3001
CONNECTION_STRING=mongodb://host.docker.internal:27017
JWT_SECRET=your_jwt_secret_here
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Deployment

**Build Application**
```bash
# Windows PowerShell
docker-compose --env-file .\webServer\config\.env.local build

# Unix/Linux/macOS
docker-compose --env-file ./webServer/config/.env.local build
```

**Start Services**
```bash
# Windows PowerShell
docker-compose --env-file .\webServer\config\.env.local up -d

# Unix/Linux/macOS
docker-compose --env-file ./webServer/config/.env.local up -d
```

### Testing

**Run C++ Backend Tests**
```bash
docker-compose --env-file ./webServer/config/.env.local run --rm cpp_server ./runTests
```

**Run Performance Benchmark**
```bash
docker-compose --env-file ./webServer/config/.env.local exec cpp_server /usr/src/myapp/data/benchmark 1000000
```

**Generate Coverage Report**
```bash
docker-compose --env-file ./webServer/config/.env.local exec cpp_server lcov --extract coverage.info '/usr/src/myapp/src/*' --output-file src_coverage.info --ignore-errors inconsistent
```

### Administrative Access

To grant administrative privileges:
```bash
docker exec -it mongo mongosh
```

In the MongoDB shell:
```javascript
db.users.updateOne({ email: "YOUR_EMAIL" }, { $set: { role: "admin" } })
```

## Application Access

**Web Application**: http://localhost:3001/login  
Replace port number with your configured FRONTEND_PORT value.

## Android Development

### Setup Instructions
1. Open Android Studio
2. Select "New Project from Version Control"
3. Enter repository URL: https://github.com/omrinahum/ProjectFlix.git
4. Navigate to File > Open and select the `android/` directory
5. Sync project with Gradle files
6. Configure API endpoint in `android/res/values/strings.xml` (default: http://10.0.2.2:3000/api/)
7. Build and run the application

**Note**: Ensure the Android API URL matches your backend server port configuration.
