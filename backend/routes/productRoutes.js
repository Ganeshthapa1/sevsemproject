const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { protect, admin, vendor } = require("../middleware/authMiddleware");
const upload = require('../middleware/uploadMiddleware');
const { Product } = require('../models');

// Get all products (public)
router.get("/", productController.getAllProducts);

// Get a single product (public)
router.get("/:id", productController.getProductById);

// Admin routes
router.post("/admin", protect, admin, upload.array('images', 5), productController.createProduct);
router.patch("/admin/:id", protect, admin, upload.array('images', 5), productController.updateProduct);
router.delete("/admin/:id", protect, admin, productController.deleteProduct);

// Vendor routes
router.post("/vendor", protect, vendor, upload.array('images', 5), async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      vendor: req.user._id
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
});

router.put("/vendor/:id", protect, vendor, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify product belongs to vendor
    if (product.vendor && product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, vendor: req.user._id },
      { new: true }
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error: error.message });
  }
});

router.delete("/vendor/:id", protect, vendor, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify product belongs to vendor
    if (product.vendor && product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting product', error: error.message });
  }
});

// Get vendor's products
router.get("/vendor/products", protect, vendor, async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id });
    res.json(products);
  } catch (error) {
    console.error("Vendor products error:", error);
    res.status(500).json({ message: "Error fetching vendor products", error: error.message });
  }
});

module.exports = router;
