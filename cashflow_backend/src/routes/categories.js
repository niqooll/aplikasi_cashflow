const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');

// Semua rute di sini dilindungi oleh authMiddleware
router.use(authMiddleware);

router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory);
router.delete('/:id', categoryController.deleteCategory);
router.put('/:id/budget', categoryController.updateCategoryBudget);

module.exports = router;