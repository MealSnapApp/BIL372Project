const express = require('express');
const router = express.Router();
const SignUpController = require('../Controllers/SignUpController');
const SignInController = require('../Controllers/SignInController');
const authenticateToken = require('../middlewares/authMiddleware');
const LogoutController = require('../Controllers/LogoutController');
const UserService = require('../services/userService/UserService');

// If the user signed in
router.post('/logout', authenticateToken, LogoutController.logout);

router.post('/sign-up', SignUpController.signup);
router.post('/sign-in', SignInController.signin);

router.get('/check-auth', authenticateToken, async (req, res) => {
    try {
        const user = await UserService.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ isAuthenticated: false, message: "User not found" });
        }
        // Don't send password back
        const { password, ...userWithoutPassword } = user;
        res.status(200).json({ isAuthenticated: true, user: userWithoutPassword });
    } catch (error) {
        console.error("Check auth error:", error);
        res.status(500).json({ isAuthenticated: false, message: "Internal server error" });
    }
});

module.exports = router;