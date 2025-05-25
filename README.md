## Description

Welcome to **ProjectFlix** – a full-stack, cross-platform movie streaming application inspired by Netflix! 

## Overview

Our application architecture follows a modular and scalable workflow across multiple technologies:

- C++ Recommendation Server - 
We started by developing a C++ backend server responsible for managing users, tracking their watch history, and generating personalized movie recommendations based on user similarity and preferences.

- Node.js Server (MVC Architecture) - 
We then built a Node.js server using the MVC design pattern. This server handles movie and category objects, provides CRUD operations via MongoDB, and acts as a bridge between the frontend and the C++ recommendation engine.

- Cross-Platform Clients: React Web App & Android App - 
Finally, we developed two client interfaces: a React-based web frontend and a native Android application, allowing users to seamlessly access the platform across devices.

Feel free to explore [Wiki](wiki/) for detailed documentation and screenshots.

## 🗂️ Project Structure
```
ProjectFlix/
├── client/                              # React web application 
│   ├── public/                          # Static assets
│   ├── src/                             # React source code
│   │   ├── components/                  # UI components
│   │   │   ├── Movies/                  # Movie-related components
│   │   │   ├── ScrollableMovieCard/     # Recommended movies card
│   │   │   ├── MovieModal/              # Movie details modal
│   │   │   ├── Auth/                    # Authentication components
│   │   │   └── ...                      # Other components
│   │   ├── services/                    # API communication
│   │   │   └── api.js                   # HTTP client and API methods
│   │   └── App.js                       # Main app component
│   └── package.json                     # Dependencies and scripts
├── webServer/                           # Node.js backend server (MVC)
│   ├── controllers/                     # Request handlers
│   │   ├── UserController.js            # User operations
│   │   ├── MovieController.js           # Movie management
│   │   ├── RecommendationController.js  # C++ engine integration
│   │   └── ...                          # Other controllers
│   ├── models/                          # Database schemas (MongoDB)
│   │   ├── UserModel.js                 # User data model
│   │   ├── MovieModel.js                # Movie data model
│   │   └── ...                          # Other models
│   ├── routes/                          # API endpoints
│   │   ├── UserRoutes.js                # User API routes
│   │   ├── MovieRoute.js                # Movie API routes
│   │   └── ...                          # Other routes
│   ├── middlewares/                     # Express middleware
│   │   ├── auth.js                      # Authentication middleware
│   │   └── upload.js                    # File upload handling
│   ├── services/                        # Business logic
│   │   ├── UserServices.js              # User operations
│   │   ├── MovieService.js              # Movie management
│   │   ├── RecommendationService.js     # C++ engine integration
│   │   └── ...                          # Other services
│   ├── config/                          # Configuration files
│   │   └── .env.local                   # Environment variables (create this)
│   ├── static/                          # Static file storage
│   └── app.js                           # Express application
├── src/                                 # C++ recommendation engine
│   ├── main.cpp                         # TCP server entry point
│   ├── UserManager.cpp                  # User data management
│   ├── MovieRecommender.cpp             # Recommendation algorithms
│   ├── DatabaseManager.cpp              # Data persistence
│   └── ...                              # Other C++ source files
├── headers/                             # C++ header files
│   ├── UserManager.h
│   ├── MovieRecommender.h
│   └── ...                              # Other header files
├── tests/                               # C++ unit tests
│   ├── UserManagerTest.cpp
│   ├── RecommendationTest.cpp
│   ├── ServerMenuTest.cpp
│   └── ...                              # Other test files
├── data/                                # Recommendation engine data
├── wiki/                                # Project documentation
├── docker-compose.yml                   # Multi-container orchestration
├── Dockerfile.client                    # React frontend container
├── CMakeLists.txt                       # C++ build configuration
└── README.md                            # Project documentation
```

### Key Components:

- **C++ Backend**: Recommendation engine and core business logic
- **Node.js Server**: REST API and database operations
- **React Frontend**: Web user interface
- **Android App**: Native mobile interface
- **Docker**: Containerization and deployment
- **MongoDB**: Data persistence

### Architecture Overview:

1. **Backend Layer**:
   - Node.js REST API
   - MongoDB integration
   - Authentication/Authorization
   - File handling

3. **Recommendation Engine**:
   - C++ core logic
   - User similarity analysis
   - Watch history processing
   - Movie recommendations

3. **Frontend Layer**:
   - React web application
   - Android native app
   - User interface components
   - State management

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/Traz77/ProjectFlix.git
```

### 2. Configure Environment

Create a config folder and `.env.local` file for the backend:

```sh
mkdir -p webServer/config
touch webServer/config/.env.local
```

Add the following to `webServer/config/.env.local` (replace `XXXX` as needed):

```env
PORT=XXXX                  # Node.js server port (e.g., 3000)
REACT_APP_API_URL=http://localhost:XXXX/
RECOMMENDATION_PORT=XXXX   # C++ server port (e.g., 5555)
FRONTEND_PORT=XXXX         # React frontend port (e.g., 3001)
CONNECTION_STRING=mongodb://host.docker.internal:27017
JWT_SECRET=XXXX            # Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Using docker commands (in the the main folder): 

### 3. Run with Docker (in the the main folder aka PROJECTFLIX):

**Build containers:**

- PowerShell:
  ```sh
  docker-compose --env-file .\webServer\config\.env.local build
  ```
- Unix/Mac:
  ```sh
  docker-compose --env-file ./webServer/config/.env.local build
  ```

**Start services:**

- PowerShell:
  ```sh
  docker-compose --env-file .\webServer\config\.env.local up -d
  ```
- Unix/Mac:
  ```sh
  docker-compose --env-file ./webServer/config/.env.local up -d
  ```

---
### 4. Run C++ Server Tests (if you want)

```sh
docker-compose --env-file ./webServer/config/.env.local run --rm cpp_server ./runTests
```

---

### 5. Make Yourself Admin (if you want)

```sh
docker exec -it mongo mongosh
# In the MongoDB shell:
db.users.updateOne({ email: "YOUR_EMAIL@example.com" }, { $set: { role: "admin" } })
```

---
## 🌐 Access the App

- **Frontend:** [http://localhost:XXXX/login](http://localhost:XXXX/login) (replace XXXX with your frontend port)

---

To run the android app: 

On android studio

Press File -> New -> Project From Version Control -> Insert the URL https://github.com/Traz77/ProjectFlix.git

Then Press File -> Open -> choose android -> Sync with Gradle, use R language and run 

## 📱 Android App

1. Open Android Studio
2. File → New → Project from Version Control → Paste repo URL
3. File → Open → Select `android/` → Sync with Gradle
4. Update `android/res/values/strings.xml` if you change backend port (`api_url`)
5. Run the app

- Please Note - The base url of the android port is 3000 (http://10.0.2.2:3000/api/) this should match the backend port. (point number 4)

---


Enjoy streaming with ProjectFlix! 🎬🍿
