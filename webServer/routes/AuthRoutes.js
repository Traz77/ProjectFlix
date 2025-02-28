const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// SignIn Route to check for authentication
router.post('/', UserController.signIn);

module.exports = router;