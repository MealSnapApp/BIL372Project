const express = require('express');
const router = express.Router();
const SignUpController = require('../Controllers/SignUpController');
const SignInController = require('../Controllers/SignInController');
const authenticateToken = require('../middlewares/authMiddleware');

// If the user signed in
// router.post('/logout', authenticateToken, LogoutController.logout);

router.post('/sign-up', SignUpController.signup);
router.post('/sign-in', SignInController.signin);

router.get('/check-auth', authenticateToken, (req, res) => {
    res.status(200).json({ isAuthenticated: true, user: req.user });
});

module.exports = router;