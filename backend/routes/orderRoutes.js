const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect, admin, vendor } = require("../middleware/authMiddleware");
const { Order } = require("../models");

// Create a new order
router.post("/", protect, orderController.createOrder);

// Get all orders (admin only)
router.get("/all", protect, admin, orderController.getAllOrders);

// Get user's orders
router.get("/user", protect, orderController.getUserOrders);

// Get vendor's orders
router.get("/vendor", protect, vendor, async (req, res) => {
  try {
    console.log("Fetching vendor orders for user ID:", req.user._id);
    const orders = await Order.find({
      "items.product.vendor": req.user._id,
    })
      .populate("user", "name email")
      .populate("items.product", "name price images");
    console.log("Found vendor orders:", orders.length);
    res.json(orders);
  } catch (error) {
    console.error("Vendor orders error:", error);
    res.status(500).json({ message: "Error fetching vendor orders", error: error.message });
  }
});

// Get vendor orders by ID
router.get('/vendor/:vendorId', protect, vendor, async (req, res) => {
  try {
    const orders = await Order.find({
      'items.vendor': req.params.vendorId
    }).populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor orders', error: error.message });
  }
});

// Get a specific order by ID
router.get("/:orderId", protect, orderController.getOrderById);

// Update order status (admin only)
router.patch("/:orderId/status", protect, admin, orderController.updateOrderStatus);

// Update payment status (admin only)
router.patch("/:orderId/payment", protect, admin, orderController.updatePaymentStatus);

// Update payment method (user can update their own order payment)
router.patch("/:orderId/payment-method", protect, orderController.updatePaymentMethod);

// Update order status (vendor)
router.put('/:id/status', protect, vendor, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify order contains products from this vendor
    const hasVendorProducts = order.items.some(
      item => item.vendor && item.vendor.toString() === req.user._id.toString()
    );

    if (!hasVendorProducts) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = req.body.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error updating order status', error: error.message });
  }
});

module.exports = router;
