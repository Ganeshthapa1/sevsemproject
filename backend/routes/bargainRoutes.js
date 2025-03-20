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
const { Bargain, Product } = require('../models');

// Create a new bargain request
router.post("/", protect, createBargain);

// Get all bargains (admin only)
router.get("/admin", protect, admin, async (req, res) => {
  try {
    const bargains = await Bargain.find({})
      .populate('user', 'name email')
      .populate('product', 'name price images vendor');
    res.json(bargains);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bargains', error: error.message });
  }
});

// Get user's bargains
router.get("/user", protect, async (req, res) => {
  try {
    const bargains = await Bargain.find({ user: req.user._id })
      .populate('product', 'name price images vendor');
    res.json(bargains);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bargains', error: error.message });
  }
});

// Get vendor's bargains
router.get("/vendor", protect, vendor, async (req, res) => {
  try {
    // Get all products owned by the vendor
    const vendorProducts = await Product.find({ vendor: req.user._id });
    const vendorProductIds = vendorProducts.map(product => product._id);

    // Find bargains for the vendor's products
    const bargains = await Bargain.find({
      product: { $in: vendorProductIds }
    })
      .populate('user', 'name email')
      .populate('product', 'name price images vendor');

    res.json(bargains);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor bargains', error: error.message });
  }
});

// Update bargain status (admin)
router.put("/admin/:id", protect, admin, async (req, res) => {
  try {
    const bargain = await Bargain.findById(req.params.id);
    if (!bargain) {
      return res.status(404).json({ message: 'Bargain request not found' });
    }

    bargain.status = req.body.status;
    if (req.body.counterOffer) {
      bargain.counterOffer = req.body.counterOffer;
    }
    const updatedBargain = await bargain.save();
    res.json(updatedBargain);
  } catch (error) {
    res.status(500).json({ message: 'Error updating bargain request', error: error.message });
  }
});

// Update bargain status (vendor)
router.put("/vendor/:id", protect, vendor, async (req, res) => {
  try {
    const bargain = await Bargain.findById(req.params.id)
      .populate('product', 'vendor');

    if (!bargain) {
      return res.status(404).json({ message: 'Bargain request not found' });
    }

    // Check if the product belongs to the vendor
    if (bargain.product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this bargain request' });
    }

    bargain.status = req.body.status;
    if (req.body.counterOffer) {
      bargain.counterOffer = req.body.counterOffer;
    }
    const updatedBargain = await bargain.save();
    res.json(updatedBargain);
  } catch (error) {
    res.status(500).json({ message: 'Error updating bargain request', error: error.message });
  }
});

// Cancel bargain request
router.delete("/:bargainId", protect, cancelBargain);

module.exports = router; 