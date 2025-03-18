const express = require("express");
const router = express.Router();
const {
  createBargain,
  getAllBargains,
  getUserBargains,
  updateBargainStatus,
  cancelBargain,
} = require("../controllers/bargainController");
const { protect, admin } = require("../middleware/authMiddleware");

// Create a new bargain request
router.post("/", protect, createBargain);

// Get all bargain requests (admin only)
router.get("/all", protect, admin, getAllBargains);

// Get user's bargain requests
router.get("/user", protect, getUserBargains);

// Update bargain status (admin only)
router.patch("/:bargainId/status", protect, admin, updateBargainStatus);

// Cancel bargain request
router.delete("/:bargainId", protect, cancelBargain);

module.exports = router; 