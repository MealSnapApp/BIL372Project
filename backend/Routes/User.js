const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/UserController');
const authenticateToken = require('../middlewares/authMiddleware');

router.get('/search', authenticateToken, UserController.searchUsers);
router.put('/update', authenticateToken, UserController.updateUser);

module.exports = router;
