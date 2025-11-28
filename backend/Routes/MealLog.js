const express = require('express');
const router = express.Router();
const MealLogController = require('../Controllers/MealLogController');
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/', authenticateToken, MealLogController.addMealLog);
router.get('/', authenticateToken, MealLogController.getDailyLogs);
router.get('/all', authenticateToken, MealLogController.getAllUserLogs);
router.delete('/:id', authenticateToken, MealLogController.deleteMealLog);

module.exports = router;
