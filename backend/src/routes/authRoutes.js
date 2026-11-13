const express = require("express");

const {
    registerUser,
    loginUser,
    acceptInvitation,
    getProfile,
} = require("../controllers/authController");

const {
    protect,
} = require("../middleware/authMiddleware");

const router = express.Router();


// Public registration (disabled)
router.post("/register", registerUser);


// User login
router.post("/login", loginUser);


// Employee accepts invitation and creates account
router.post("/accept-invitation", acceptInvitation);


// Get authenticated user profile
router.get("/profile", protect, getProfile);


module.exports = router;