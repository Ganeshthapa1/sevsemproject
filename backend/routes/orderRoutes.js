const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

// Create a new order
router.post("/", protect, orderController.createOrder);

// Get all orders (admin only)
router.get("/all", protect, admin, orderController.getAllOrders);

// Get user's orders
router.get("/user", protect, orderController.getUserOrders);

// Get a specific order by ID
router.get("/:orderId", protect, orderController.getOrderById);

// Update order status (admin only)
router.patch("/:orderId/status", protect, admin, orderController.updateOrderStatus);

// Update payment status (admin only)
router.patch("/:orderId/payment", protect, admin, orderController.updatePaymentStatus);

// Update payment method (user can update their own order payment)
router.patch("/:orderId/payment-method", protect, orderController.updatePaymentMethod);

module.exports = router;
