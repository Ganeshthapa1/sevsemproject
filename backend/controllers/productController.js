const { Product } = require("../models");
const path = require("path");

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Error fetching product" });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    // Check if all required fields are present
    const requiredFields = ['name', 'description', 'price', 'category', 'stock'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Check if images are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    // Get image paths
    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

    // Create product with validated data
    const product = new Product({
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      price: Number(req.body.price),
      category: req.body.category.trim(),
      stock: Number(req.body.stock),
      images: imagePaths,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: "Error creating product" });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Handle image updates if new images are uploaded
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
      req.body.images = [...product.images, ...newImagePaths];
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Error updating product" });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete images from local storage
    for (const imagePath of product.images) {
      const filename = imagePath.split('/').pop();
      const filepath = path.join(__dirname, '../uploads', filename);
      try {
        require('fs').unlinkSync(filepath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
};
