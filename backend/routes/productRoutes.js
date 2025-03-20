const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { protect, admin, vendor } = require("../middleware/authMiddleware");
const upload = require('../middleware/uploadMiddleware');
const { Product } = require('../models');

// Get all products
router.get("/", productController.getAllProducts);

// Create a new product
router.post("/", protect, admin, upload.array('images', 5), productController.createProduct);

// Get vendor's products
router.get("/vendor", protect, vendor, async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id });
    res.json(products);
  } catch (error) {
    console.error("Vendor products error:", error);
    res.status(500).json({ message: "Error fetching vendor products", error: error.message });
  }
});

// Get vendor products by ID
router.get('/vendor/:vendorId', protect, vendor, async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.params.vendorId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor products', error: error.message });
  }
});

// Get a single product
router.get("/:id", productController.getProductById);

// Update a product
router.patch("/:id", protect, admin, upload.array('images', 5), productController.updateProduct);

// Delete a product
router.delete("/:id", protect, admin, productController.deleteProduct);

// Add product (vendor)
router.post('/', protect, vendor, upload.array('images', 5), async (req, res) => {
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

// Update product (vendor)
router.put('/:id', protect, vendor, upload.array('images', 5), async (req, res) => {
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

// Delete product (vendor)
router.delete('/:id', protect, vendor, async (req, res) => {
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

module.exports = router;
