const categoryService = require('../services/CategoryService');
const Category = require('../models/CategoryModel');


const createCategory = async (req, res) => {
    try {
        const { name, promoted, movies } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        // Search in all categories and checks if a category with that name exists - name must be unique 
        if (await Category.findOne({name})) {
            return res.status(400).json({ error: "Category already exists"});
        }

        // Call category service to create the category
        const newCategory = await categoryService.createCategory(name, promoted, movies);

        // Add the location of the newly created category in the headers
        res.setHeader('Location', `/api/categories/${newCategory._id}`);

        // Finished succsessfully, add the location created on and finish
        return res.status(201).json(newCategory);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Retrieve all categories 
const getCategories = async (req, res) => {
    try {
        const categories = await categoryService.getCategories();

        return res.json(categories);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Retrieve specific category by Id
const getCategory = async (req, res) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        return res.json(category);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Update category name / promoted status 
const updateCategory = async (req, res) => {
    try {
        const category = await categoryService.updateCategory(req.params.id, req.body,);
        
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        
        return res.status(200).json(category);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Delete category and remove the category from all movies that has it 
const deleteCategory = async (req, res) => {
    try {
        const category = await categoryService.deleteCategory(req.params.id);

        if (!category) {
            return res.status(404).json({ errors: "Category not found" });
        }

        return res.status(204).end();

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};  

module.exports = { createCategory, getCategories, getCategory, updateCategory, deleteCategory };