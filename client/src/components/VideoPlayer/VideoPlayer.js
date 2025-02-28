// Component for displaying a video player in a modal window
import React from 'react';
import { Modal } from 'react-bootstrap';
import './VideoPlayer.css';

const VideoPlayer = ({ show, handleClose, videoPath, movieName }) => {
  // Get the server URL from the environment variables
  const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  // Check if the body has the light-mode class to determine if the player should be light mode
  const isLightMode = document.body.classList.contains('light-mode');

  // Check if the video path is a URL or a local file path
  const fullVideoPath = videoPath?.startsWith('http') ? 
    videoPath : 
    videoPath?.startsWith('/static/') ?
      `${serverUrl}${videoPath}` :
      videoPath ? `${serverUrl}/static/videos/${videoPath}` : null;

    console.log('Full video path:', fullVideoPath);

    return (
      <Modal show={show} onHide={handleClose} size="xl" centered className="video-modal">
        <Modal.Header closeButton>
          <Modal.Title>{movieName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="video-container">
            {fullVideoPath ? (
              <video
                controls
                autoPlay
                className="video-player"
                key={fullVideoPath}
              >
                <source 
                  src={fullVideoPath} 
                  type="video/mp4"
                  onError={(e) => {
                    console.error('Video loading error:', e);
                    console.log('Failed to load video from:', fullVideoPath);
                  }}
                />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div>No video file available</div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    );
  };
  
  export default VideoPlayer;