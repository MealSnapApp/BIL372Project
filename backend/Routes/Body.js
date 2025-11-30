const express = require('express');
const router = express.Router();
const { getBodyData, saveBodyData } = require('../Controllers/BodyLogController');
const authMiddleware = require('../middlewares/authMiddleware');

// Get user's body data
router.get('/data', authMiddleware, getBodyData);

// Save user's body data
router.post('/data', authMiddleware, saveBodyData);

module.exports = router;