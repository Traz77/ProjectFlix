const net = require('net');
const mongoose = require('mongoose');
const UserModel = require('../models/UserModel');
const MovieService = require('../services/MovieService');

// Connection the C++ Server 
class RecommendationService {
    // Get the given ports or set default ones 
    constructor() {
        this.port = process.env.RECOMMENDATION_PORT || 5555;
        this.host = process.env.RECOMMENDATION_HOST || 'localhost';
    }
    // The command to send to the server 
    async sendCommand(userId, movieId, commandWord) {
        try {
            let numericMovieId = null;
            if (movieId) {
                // Validate MongoDB ObjectIds
                if (!mongoose.Types.ObjectId.isValid(movieId)) {
                    throw new Error('Movie or user not found');
                }
                const movie = await MovieService.getMovieById(movieId);
            
                if (!movie) {
                    throw new Error('Movie or user not found');
                }
                // Set the movie Id to its custom number value 
                numericMovieId = movie.id;
            }
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('Movie or user not found');
            }
            const user = await UserModel.findById(userId).select('+userId');
            if (!user) {
                throw new Error('Movie or user not found');
            }
            // Set the user Id to its custom number value 
            const numericUserId = user.userId;
            
            // Open a socket and connect with the TCP server
            return new Promise((resolve, reject) => {
                const client = new net.Socket();
                client.setTimeout(2000);
    
                let data = '';
                
                //Sending the command by the command name and the movie we got, if we got 
                client.connect(this.port, this.host, () => {
                    console.log(`Sending ${commandWord} command: ${numericUserId} ${numericMovieId}`);
                    const command = numericMovieId === null 
                     ? `${commandWord} ${numericUserId}\n`
                     : `${commandWord} ${numericUserId} ${numericMovieId}\n`;
                    client.write(command);
                });
                
                // Retrieve the data 
                client.on('data', (chunk) => {
                    data += chunk;
                    console.log('Received chunk:', chunk.toString());
                    
                    const response = data.trim();
                    console.log('Complete response:', response);
    
                    if (response === '404 Not Found') {
                        client.end();
                        reject(new Error('Movie not found'));
                    } else if (response.includes('204')) {
                        client.end();
                        resolve({
                            status: 'success',
                            message: 'Movie added'
                        });
                    } else if (response.includes('201')) {
                        client.end();
                        resolve({
                            status: 'success',
                            message: 'User added'
                        });
                    } else if (response.includes('200')) {
                        const lines = data.trim().split('\n');
                        console.log('Response lines:', lines);
                    
                        // Check first line for status
                        if (!lines[0].includes('200')) {
                            client.end();
                            reject(new Error('Invalid response from recommendation service'));
                            return;
                        }
                        if (lines.length < 3) {
                            client.end();
                            reject(new Error('Invalid response from recommendation service'));
                            return;
                        }
                        let recommendations = [];
                        if (lines[2]) {
                            // Replace data parsing with:
                            const cleanResponse = lines[2].toString().replace(/\x00/g, '').trim();
                            const moviesArray = cleanResponse.split(' ');
                            recommendations = moviesArray.map((movie) => {
                                return { movieId: movie };
                            });
                            console.log('Recommendations:', recommendations);
                        }
                    
                        client.end();
                        resolve({
                            status: 'success',
                            recommendations: recommendations
                        });
                    } else {
                        client.end();
                        reject(new Error('Invalid response from recommendation service'));
                    }
                });
    
                client.on('error', (error) => {
                    console.error('Socket error:', error.message);
                    client.destroy();
                    reject(new Error('Recommendation service unavailable'));
                });
    
                client.on('timeout', () => {
                    console.error('Socket timeout');
                    client.destroy();
                    reject(new Error('Recommendation service timeout'));
                });
            });
        } catch (error) {
            console.error('PostRecommendations error:', error);
            throw error;
        }
    }
}

module.exports = new RecommendationService();