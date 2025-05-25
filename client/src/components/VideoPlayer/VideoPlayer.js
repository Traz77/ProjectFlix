import React from 'react';
import { Modal } from 'react-bootstrap';
import './VideoPlayer.css';

const VideoPlayer = ({ show, handleClose, videoPath, movieName }) => {
  const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  const isLightMode = document.body.classList.contains('light-mode');

  // Function to detect if URL is YouTube
  const isYouTubeUrl = (url) => {
    if (!url) return false;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    return youtubeRegex.test(url);
  };

  // Function to get YouTube embed URL
  const getYouTubeEmbedUrl = (url) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&controls=1`;
    }
    return null;
  };

  // Function to get local video URL
  const getLocalVideoUrl = (path) => {
    if (!path) return null;
    
    // If it's already a full URL, return as is
    if (path.startsWith('http')) {
      return path;
    }
    
    // If it's a static file path
    if (path.startsWith('/static/')) {
      return `${serverUrl}${path}`;
    }
    
    // Default to videos folder
    return `${serverUrl}/static/videos/${path}`;
  };

  // Determine video type and get appropriate URL
  const isYouTube = isYouTubeUrl(videoPath);
  const videoUrl = isYouTube ? getYouTubeEmbedUrl(videoPath) : getLocalVideoUrl(videoPath);

  console.log('Video path:', videoPath);
  console.log('Is YouTube:', isYouTube);
  console.log('Final URL:', videoUrl);

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered className="video-modal">
      <Modal.Header closeButton>
        <Modal.Title>{movieName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="video-container">
          {videoUrl ? (
            isYouTube ? (
              // YouTube iframe
              <iframe
                src={videoUrl}
                title={movieName}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="video-player"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              // Local video file
              <video
                controls
                autoPlay
                className="video-player"
                key={videoUrl}
                onError={(e) => {
                  console.error('Video loading error:', e);
                  console.log('Failed to load video from:', videoUrl);
                }}
              >
                <source 
                  src={videoUrl} 
                  type="video/mp4"
                />
                <source 
                  src={videoUrl} 
                  type="video/webm"
                />
                <source 
                  src={videoUrl} 
                  type="video/ogg"
                />
                Your browser does not support the video tag.
              </video>
            )
          ) : (
            <div className="no-video-message">
              <p>No video file available</p>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default VideoPlayer;