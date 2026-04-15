# ProjectFlix

ProjectFlix is a web-focused movie streaming platform built from three cooperating services: a React frontend, a Node.js API with MongoDB, and a C++ recommendation engine.

## Architecture

ProjectFlix uses a multi-tier architecture with clear service boundaries.

**C++ Recommendation Engine**
- High-performance TCP service for recommendation logic.
- Manages recommendation queries and similarity calculations.

**Node.js API Server**
- REST API layer built with Express (MVC-style organization).
- Handles authentication, media metadata, and persistence in MongoDB.
- Communicates with the C++ engine for recommendation flows.

**React Web Client**
- Browser-based UI for authentication, browsing, and playback.
- Consumes API endpoints exposed by the Node.js server.

Additional documentation and screenshots are available in [wiki/](wiki/).

## Project Structure

```text
ProjectFlix/
├── client/                     # React web application
│   ├── public/
│   └── src/
│       ├── components/
│       ├── services/
│       └── ...
├── webServer/                  # Node.js backend (controllers/models/routes/services)
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── scripts/
│   └── app.js
├── src/                        # C++ engine implementation
├── headers/                    # C++ headers
├── tests/                      # C++ tests and benchmark
├── data/                       # Runtime data
├── wiki/                       # Project docs and screenshots
├── docker-compose.yml          # Multi-service orchestration
├── Dockerfile.client           # React container build
├── CMakeLists.txt              # C++ build configuration
└── README.md
```

## Technology Stack

- Web client: React
- API server: Node.js + Express
- Recommendation engine: C++ (TCP server)
- Database: MongoDB
- Infrastructure: Docker Compose

## Prerequisites

- Docker Desktop (Docker + Compose)
- Node.js (used for local helper commands like JWT generation)

## Configuration

1. Create the configuration directory:

```bash
mkdir -p webServer/config
```

2. Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

3. Create webServer/config/.env.local:

```env
PORT=3000
REACT_APP_API_URL=http://localhost:3000/
RECOMMENDATION_PORT=5555
FRONTEND_PORT=3001
CONNECTION_STRING=mongodb://host.docker.internal:27017
JWT_SECRET=your_generated_secret
```

## Build and Run

Build:

```bash
# Windows PowerShell
docker-compose --env-file .\webServer\config\.env.local build

# Unix/Linux/macOS
docker-compose --env-file ./webServer/config/.env.local build
```

Start services:

```bash
# Windows PowerShell
docker-compose --env-file .\webServer\config\.env.local up -d

# Unix/Linux/macOS
docker-compose --env-file ./webServer/config/.env.local up -d
```

## Testing and Benchmark

Run C++ tests:

```bash
docker-compose --env-file ./webServer/config/.env.local run --rm cpp_server ./runTests
```

Run performance benchmark (persistent connections, mixed GET/POST/PATCH loads, 50 benchmark client threads):

```bash
docker-compose --env-file ./webServer/config/.env.local exec cpp_server /usr/src/myapp/build/benchmark 10000
```

- Representative run (10000 requests):
	- Time taken: 2.43 seconds
	- Successful requests: 10000
	- Failed requests: 0
	- Throughput: 4118.81 req/sec
	- Latency: min 0.01 ms, avg 11.70 ms, p50 9.48 ms, p95 36.08 ms, p99 53.86 ms, max 163.99 ms
	- Response types: 200=7807, 201=0, 204=1980, 400=0, 404=213, 500=0


## Application Access

- Web UI: http://localhost:3001/login
- API: http://localhost:3000
- MongoDB: localhost:27017

Use configured environment ports if you changed defaults.

## Administrative Access

Open Mongo shell:

```bash
docker exec -it mongo mongosh
```

Promote a user to admin:

```javascript
db.users.updateOne({ email: "YOUR_EMAIL" }, { $set: { role: "admin" } })
```


