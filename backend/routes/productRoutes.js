const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require('../middleware/uploadMiddleware');

// Get all products
router.get("/", productController.getAllProducts);

// Create a new product
router.post("/", protect, admin, upload.array('images', 5), productController.createProduct);

// Get a single product
router.get("/:id", productController.getProductById);

// Update a product
router.patch("/:id", protect, admin, upload.array('images', 5), productController.updateProduct);

// Delete a product
router.delete("/:id", protect, admin, productController.deleteProduct);

module.exports = router;
