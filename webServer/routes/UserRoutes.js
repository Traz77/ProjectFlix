const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { requireAuth } = require('../middlewares/auth');

// Route to users 
router.post('/', userController.createUser)
router.get('/', requireAuth, userController.getUsers);
router.get('/me', requireAuth, userController.getCurrentUser);

// Route to function of User by its email
router.get('/email/:email', requireAuth, userController.getUserByEmail);

//Route to get watch history of user
router.get('/history', requireAuth, userController.getWatchHistory);

// Route to function of User by its ID
router.route('/:id')
    .get(requireAuth, userController.getUserById)
    .patch(requireAuth, userController.updateUser);

module.exports = router;