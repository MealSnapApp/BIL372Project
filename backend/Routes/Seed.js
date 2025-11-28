const express = require('express');
const router = express.Router();
const SeedController = require('../Controllers/SeedController');
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/', authenticateToken, SeedController.seedData);

module.exports = router;
