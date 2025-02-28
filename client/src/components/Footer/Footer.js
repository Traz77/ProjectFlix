//component for footer of the page
import React from 'react';
import './Footer.css';

const Footer = () => {
  // Get the current year
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {currentYear} ProjectFlix. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;