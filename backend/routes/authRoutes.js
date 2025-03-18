const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User, Cart, Order } = require("../models");
const { protect, admin } = require("../middleware/authMiddleware");
const { register, login, getUserProfile } = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getUserProfile);

// Get current user
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Error getting user data" });
  }
});

// Get all users (admin only)
router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Toggle user active status (admin only)
router.patch(
  "/users/:userId/toggle-status",
  protect,
  admin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role === "admin") {
        return res.status(403).json({ message: "Cannot disable admin users" });
      }

      // Toggle the isActive status
      user.isActive = !user.isActive;
      await user.save();

      // If user is deactivated, cancel their active orders
      if (!user.isActive) {
        await Order.updateMany(
          {
            user: user._id,
            status: { $nin: ["delivered", "cancelled"] },
          },
          { $set: { status: "cancelled" } }
        );
      }

      res.json({
        message: `User ${
          user.isActive ? "activated" : "deactivated"
        } successfully`,
        isActive: user.isActive,
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
      res.status(500).json({ message: "Failed to toggle user status" });
    }
  }
);

module.exports = router;
