const express = require('express');
const router = express.Router();
const FoodController = require('../Controllers/FoodController');

router.get('/', FoodController.getAllFoods);
router.get('/search', FoodController.searchFoods);
router.post('/', FoodController.createFood);

module.exports = router;
