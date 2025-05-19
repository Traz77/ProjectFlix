## Description

Welcome to **ProjectFlix** – a full-stack, cross-platform movie streaming application inspired by Netflix! 

## Overview

Our application architecture follows a modular and scalable workflow across multiple technologies:

- C++ Recommendation Server
We started by developing a C++ backend server responsible for managing users, tracking their watch history, and generating personalized movie recommendations based on user similarity and preferences.

- Node.js Server (MVC Architecture)
We then built a Node.js server using the MVC design pattern. This server handles movie and category objects, provides CRUD operations via MongoDB, and acts as a bridge between the frontend and the C++ recommendation engine.

- Cross-Platform Clients: React Web App & Android App
Finally, we developed two client interfaces: a React-based web frontend and a native Android application, allowing users to seamlessly access the platform across devices.

Feel free to explore [Wiki](wiki/) for detailed documentation and screenshots.

## 🗂️ Project Structure



## 🚀 Getting Started

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