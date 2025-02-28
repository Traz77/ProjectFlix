const express = require('express');
var router = express.Router();
const categoryController = require('../controllers/CategoryController');
const { requireAuth } = require('../middlewares/auth');

// Route to categories
router.route('/')  
    .get(categoryController.getCategories)
    .post(requireAuth, categoryController.createCategory);

// Route to function of categories by its ID
router.route('/:id')
    .get(categoryController.getCategory)
    .patch(requireAuth, categoryController.updateCategory)
    .delete(requireAuth, categoryController.deleteCategory);

module.exports = router;

