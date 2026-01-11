const net = require('net');
const mongoose = require('mongoose');
const UserModel = require('../models/UserModel');
const MovieService = require('../services/MovieService');

// Connection the C++ Server 
class RecommendationService {
    constructor() {
        this.port = process.env.RECOMMENDATION_PORT || 5555;
        this.host = process.env.RECOMMENDATION_HOST || 'localhost';
        this.client = new net.Socket();
        this.isConnected = false;
        this.isConnecting = false;  // Track if connection attempt is in progress
        this.reconnectTimer = null; // Track reconnection timer
        this.connectionWaiters = []; // Queue of promises waiting for connection
        this.requestsQueue = []; // Queue of {resolve, reject, expectingData}
        this.buffer = ''; // Data buffer for incomplete responses

        this.initializeConnection();
    }

    initializeConnection() {
        // Prevent overlapping connection attempts
        if (this.isConnecting) {
            return;
        }

        // Clear any pending reconnection timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        // Clean up existing connection if any
        if (this.client) {
            this.client.removeAllListeners();
            this.client.destroy();
        }

        // Create fresh socket
        this.client = new net.Socket();
        this.isConnected = false;
        this.isConnecting = true;

        this.client.connect(this.port, this.host, () => {
            console.log('Connected to C++ Recommendation Engine');
            this.isConnected = true;
            this.isConnecting = false;

            // Resolve all waiting promises
            while (this.connectionWaiters.length > 0) {
                const resolve = this.connectionWaiters.shift();
                resolve();
            }
        });

        this.client.on('data', (data) => {
            console.log('[DEBUG] Received data:', data.toString());
            this.buffer += data.toString();
            this.processBuffer();
        });

        this.client.on('close', () => {
            console.log('Connection closed. Reconnecting in 3s...');
            this.isConnected = false;
            this.isConnecting = false;

            // Process any remaining data in buffer before handling close
            if (this.buffer.length > 0) {
                this.processBuffer();
            }

            // Handle requests that were waiting for data line (expectingData=true)
            // These won't get any more data since connection closed, so resolve them
            while (this.requestsQueue.length > 0 && this.requestsQueue[0].expectingData) {
                const { resolve } = this.requestsQueue.shift();
                console.log('[DEBUG] Connection closed while expecting data, resolving with empty');
                resolve({ success: true, recommendations: [], data: '' });
            }

            this.reconnectTimer = setTimeout(() => this.initializeConnection(), 3000);
        });

        this.client.on('error', (err) => {
            console.error('Socket error:', err.message);
            this.isConnected = false;
            this.isConnecting = false;
            // Reject all pending requests
            while (this.requestsQueue.length > 0) {
                const { reject } = this.requestsQueue.shift();
                reject(new Error('Recommendation service connection failed'));
            }
        });
    }

    processBuffer() {
        let newlineIndex;
        while ((newlineIndex = this.buffer.indexOf('\n')) !== -1) {
            const line = this.buffer.substring(0, newlineIndex).trim();
            this.buffer = this.buffer.substring(newlineIndex + 1);

            if (this.requestsQueue.length > 0) {
                const request = this.requestsQueue[0]; // Peek at first request

                // Handle empty lines (e.g. empty response or just newline)
                if (!line) {
                    // Check if we're expecting data after a status code
                    if (request.expectingData) {
                        // Empty line after 200 OK means no recommendations
                        const { resolve } = this.requestsQueue.shift();
                        resolve({ success: true, recommendations: [], data: '' });
                    } else {
                        // Just skip empty lines
                    }
                    continue;
                }

                // Check if we're expecting data (already got status code)
                if (request.expectingData) {
                    // This is the data line following a status code
                    const { resolve } = this.requestsQueue.shift();
                    console.log('[DEBUG] Received data line:', line);
                    resolve({ success: true, data: line });
                    continue;
                }

                // Handle status codes
                if (line.startsWith('404') || line.startsWith('400')) {
                    const { resolve } = this.requestsQueue.shift();
                    resolve({ success: false, message: line });
                } else if (line.startsWith('201') || line.startsWith('204')) {
                    // POST returns 201 Created, PATCH/DELETE return 204 No Content
                    // These are single-line responses (no data follows)
                    const { resolve } = this.requestsQueue.shift();
                    resolve({ success: true, message: line });
                } else if (line.startsWith('200')) {
                    // GET returns 200 OK followed by data on next line
                    console.log('[DEBUG] Received 200 OK, waiting for data line...');
                    request.expectingData = true;
                    // Don't shift! Keep request in queue to get data line
                } else {
                    // Data line without prior status code (legacy format or unknown response)
                    const { resolve } = this.requestsQueue.shift();
                    resolve({ success: true, data: line });
                }
            }
        }
    }

    // Wait for connection to be established (with timeout)
    async waitForConnection(timeoutMs = 10000) {
        if (this.isConnected) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                const index = this.connectionWaiters.indexOf(resolve);
                if (index !== -1) {
                    this.connectionWaiters.splice(index, 1);
                }
                reject(new Error('Connection timeout - recommendation service unavailable'));
            }, timeoutMs);

            this.connectionWaiters.push(() => {
                clearTimeout(timeout);
                resolve();
            });
        });
    }

    async sendCommand(userId, movieId, commandWord) {
        console.log(`[DEBUG] sendCommand called. userId: ${userId}, movieId: ${movieId}, cmd: ${commandWord}`);
        // Wait for connection to be established instead of failing immediately
        await this.waitForConnection();
        console.log('[DEBUG] sendCommand: Connection established/ready.');

        let numericMovieId = null;
        if (movieId) {
            console.log(`[DEBUG] Validating movieId: ${movieId}`);
            if (!mongoose.Types.ObjectId.isValid(movieId)) {
                console.error(`[ERROR] Invalid movieId format: ${movieId} (not a valid MongoDB ObjectId)`);
                throw new Error('Invalid movie ID format');
            }
            console.log(`[DEBUG] Looking up movie in database with ObjectId: ${movieId}`);
            const movie = await MovieService.getMovieById(movieId);
            if (!movie) {
                console.error(`[ERROR] Movie not found in database with ObjectId: ${movieId}`);
                console.error(`[ERROR] This could mean: 1) Movie was deleted, 2) Invalid ID was passed, 3) Database connection issue`);
                throw new Error('Movie not found');
            }
            console.log(`[DEBUG] Movie found: ${movie.name} (MongoDB _id: ${movie._id})`);
            if (!movie.id) {
                console.error(`[ERROR] Movie "${movie.name}" (MongoDB _id: ${movieId}) has no custom numeric ID field`);
                console.error(`[ERROR] Movie object:`, JSON.stringify(movie, null, 2));
                throw new Error('Movie missing custom ID');
            }
            numericMovieId = movie.id;
            console.log(`[DEBUG] Movie custom numeric ID: ${numericMovieId}`);
        }

        console.log(`[DEBUG] Validating userId: ${userId}`);
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error(`[ERROR] Invalid userId format: ${userId} (not a valid MongoDB ObjectId)`);
            throw new Error('Invalid user ID format');
        }
        console.log(`[DEBUG] Looking up user in database with ObjectId: ${userId}`);
        const user = await UserModel.findById(userId).select('+userId');
        if (!user) {
            console.error(`[ERROR] User not found in database with ObjectId: ${userId}`);
            console.error(`[ERROR] This could mean: 1) User was deleted, 2) Invalid ID was passed, 3) Database connection issue`);
            throw new Error('User not found');
        }
        console.log(`[DEBUG] User found: ${user.email} (MongoDB _id: ${user._id})`);
        if (!user.userId) {
            console.error(`[ERROR] User "${user.email}" (MongoDB _id: ${userId}) has no numeric userId field`);
            console.error(`[ERROR] This might be a newly created user whose pre-save hook hasn't completed.`);
            console.error(`[ERROR] User object:`, JSON.stringify({ _id: user._id, email: user.email, userId: user.userId }, null, 2));
            throw new Error('User missing numeric ID');
        }
        const numericUserId = user.userId;
        console.log(`[DEBUG] sendCommand: User ${userId} -> Numeric ${numericUserId}, Movie ${movieId} -> Numeric ${numericMovieId}`);

        return new Promise((resolve, reject) => {
            // Safety Timeout: 5 seconds
            const timeout = setTimeout(() => {
                // Remove from queue if timed out (filter out this specific req object)
                const index = this.requestsQueue.findIndex(r => r.resolve === resolve);
                if (index !== -1) {
                    this.requestsQueue.splice(index, 1);
                    reject(new Error('Request timed out'));
                }
            }, 5000);

            // Wrap resolve/reject to clear timeout
            const wrappedResolve = (val) => { clearTimeout(timeout); resolve(val); };
            const wrappedReject = (err) => { clearTimeout(timeout); reject(err); };

            // Enqueue request
            this.requestsQueue.push({ resolve: wrappedResolve, reject: wrappedReject });

            // Send
            const command = numericMovieId === null
                ? `${commandWord} ${numericUserId}\n`
                : `${commandWord} ${numericUserId} ${numericMovieId}\n`;
            console.log(`[DEBUG] Writing to socket: ${command.trim()}`);
            this.client.write(command);
        });
    }
}

module.exports = new RecommendationService();