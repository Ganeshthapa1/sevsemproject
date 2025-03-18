const { User, Order, Bargain, Product } = require("../models");

// Create a new bargain request
exports.createBargain = async (req, res) => {
  try {
    const { productId, proposedPrice } = req.body;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already has a pending bargain for this product
    const existingBargain = await Bargain.findOne({
      product: productId,
      user: userId,
      status: "pending",
    });

    if (existingBargain) {
      return res.status(400).json({
        message: "You already have a pending bargain request for this product",
      });
    }

    // Create new bargain request
    const bargain = await Bargain.create({
      product: productId,
      user: userId,
      originalPrice: product.price,
      proposedPrice,
    });

    await bargain.populate("product user", "name price email");

    res.status(201).json(bargain);
  } catch (error) {
    console.error("Create bargain error:", error);
    res.status(500).json({ message: "Error creating bargain request" });
  }
};

// Get all bargain requests (admin only)
exports.getAllBargains = async (req, res) => {
  try {
    const bargains = await Bargain.find()
      .populate("product", "name price")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(bargains);
  } catch (error) {
    console.error("Get all bargains error:", error);
    res.status(500).json({ message: "Error fetching bargain requests" });
  }
};

// Get user's bargain requests
exports.getUserBargains = async (req, res) => {
  try {
    const bargains = await Bargain.find({ user: req.user._id })
      .populate("product", "name price")
      .sort({ createdAt: -1 });

    res.json(bargains);
  } catch (error) {
    console.error("Get user bargains error:", error);
    res.status(500).json({ message: "Error fetching user's bargain requests" });
  }
};

// Update bargain status (admin only)
exports.updateBargainStatus = async (req, res) => {
  try {
    const { bargainId } = req.params;
    const { status, adminResponse } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be accepted or rejected' });
    }

    const bargain = await Bargain.findById(bargainId);
    if (!bargain) {
      return res.status(404).json({ message: 'Bargain request not found' });
    }

    if (bargain.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update a bargain that is not pending' });
    }

    bargain.status = status;
    bargain.adminResponse = adminResponse;
    await bargain.save();

    // Update any orders that are waiting on this bargain
    const orders = await Order.find({ bargainRequest: bargainId });
    
    for (const order of orders) {
      if (order.status === 'awaiting_bargain_approval') {
        if (status === 'accepted') {
          // If bargain is accepted, update the order total to the bargained price
          order.totalAmount = bargain.proposedPrice;
          order.status = 'pending';
          await order.save();
        } else {
          // If bargain is rejected, remove the order
          await Order.findByIdAndDelete(order._id);
        }
      }
    }

    await bargain.populate("product user", "name price email");

    res.json({ message: `Bargain ${status} successfully`, bargain });
  } catch (error) {
    console.error('Update bargain status error:', error);
    res.status(500).json({ message: 'Error updating bargain status' });
  }
};

// Cancel bargain request
exports.cancelBargain = async (req, res) => {
  try {
    const { bargainId } = req.params;

    const bargain = await Bargain.findById(bargainId);
    if (!bargain) {
      return res.status(404).json({ message: "Bargain request not found" });
    }

    // Check if user owns this bargain request
    if (bargain.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to cancel this bargain request",
      });
    }

    if (bargain.status !== "pending") {
      return res.status(400).json({
        message: "This bargain request has already been processed",
      });
    }

    await bargain.remove();
    res.json({ message: "Bargain request cancelled successfully" });
  } catch (error) {
    console.error("Cancel bargain error:", error);
    res.status(500).json({ message: "Error cancelling bargain request" });
  }
}; 