const express = require("express");
const router = express.Router();
const {
  createBargain,
  getAllBargains,
  getUserBargains,
  updateBargainStatus,
  cancelBargain,
  getVendorBargains,
} = require("../controllers/bargainController");
const { protect, admin, vendor } = require("../middleware/authMiddleware");

// Create a new bargain request
router.post("/", protect, createBargain);

// Get all bargain requests (admin only)
router.get("/all", protect, admin, getAllBargains);

// Get user's bargain requests
router.get("/user", protect, getUserBargains);

// Get vendor's bargain requests
router.get("/vendor", protect, vendor, getVendorBargains);

// Update bargain status (admin or vendor)
router.patch("/:bargainId/status", protect, updateBargainStatus);

// Cancel bargain request
router.delete("/:bargainId", protect, cancelBargain);

module.exports = router; 