const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect, admin, vendor } = require("../middleware/authMiddleware");
const { Order, Product } = require("../models");

// Create a new order
router.post("/", protect, orderController.createOrder);

// Get all orders (admin only)
router.get("/admin", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price images');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// Get user's orders
router.get("/myorders", protect, orderController.getUserOrders);

// Get vendor's orders
router.get("/vendor", protect, vendor, async (req, res) => {
  try {
    console.log('Fetching orders for vendor:', req.user._id);
    
    // Get all products owned by the vendor
    const vendorProducts = await Product.find({ vendor: req.user._id });
    const vendorProductIds = vendorProducts.map(product => product._id);
    
    console.log('Vendor products:', vendorProductIds);

    // Find orders that contain the vendor's products
    const orders = await Order.find({
      'orderItems.product': { $in: vendorProductIds }
    })
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price images vendor')
      .sort({ createdAt: -1 });

    console.log('Found orders:', orders.length);

    // Filter order items to only include vendor's products
    const filteredOrders = orders.map(order => ({
      ...order.toObject(),
      orderItems: order.orderItems.filter(item => 
        vendorProductIds.includes(item.product._id.toString())
      )
    }));

    // Filter for orders with bargain requests
    const bargainOrders = filteredOrders.filter(order => 
      order.orderItems.some(item => 
        item.bargainRequest && 
        item.bargainRequest.status === 'pending'
      ) || 
      order.status === 'awaiting_bargain_approval'
    );

    console.log('Bargain orders:', bargainOrders);
    res.json(bargainOrders);
  } catch (error) {
    console.error("Get vendor orders error:", error);
    res.status(500).json({ message: 'Error fetching vendor orders', error: error.message });
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

// Update order status (admin)
router.put('/admin/:id', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = req.body.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
});

// Update order status (vendor)
router.put('/vendor/:id', protect, vendor, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('orderItems.product', 'vendor');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order contains any products owned by the vendor
    const hasVendorProducts = order.orderItems.some(
      item => item.product.vendor.toString() === req.user._id.toString()
    );

    if (!hasVendorProducts) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    const { itemId, status, vendorResponse } = req.body;

    // Update the specific order item's bargain request
    if (itemId) {
      const orderItem = order.orderItems.find(
        item => item.product._id.toString() === itemId
      );

      if (orderItem && orderItem.bargainRequest) {
        orderItem.bargainRequest.status = status;
        orderItem.bargainRequest.vendorResponse = vendorResponse;

        // If all bargain requests are handled, update order status
        const allBargainsHandled = order.orderItems.every(
          item => !item.bargainRequest || item.bargainRequest.status !== 'pending'
        );

        if (allBargainsHandled) {
          order.status = 'processing';
        }
      }
    } else {
      // Update entire order status if no specific item
      order.status = status;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
});

// Update payment status (admin only)
router.patch("/:orderId/payment", protect, admin, orderController.updatePaymentStatus);

// Update payment method (user can update their own order payment)
router.patch("/:orderId/payment-method", protect, orderController.updatePaymentMethod);

module.exports = router;
