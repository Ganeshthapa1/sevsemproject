const { Order, Product, Bargain } = require("../models");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { 
      items, 
      address,
      shippingAddress,
      paymentMethod, 
      notes,
      fullName,
      email,
      phone,
      proposedPrice
    } = req.body;
    
    const userId = req.user._id;

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required and cannot be empty" });
    }

    // Calculate total amount and validate items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.product) {
        return res.status(400).json({ message: "Each item must have a product ID" });
      }

      try {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Product ${item.product} not found` });
        }

        // Check if there's an accepted bargain for this product
        let finalPrice = product.price;
        if (item.bargainId) {
          const bargain = await Bargain.findById(item.bargainId);
          if (bargain && bargain.status === "accepted" && bargain.user.toString() === userId.toString()) {
            finalPrice = bargain.proposedPrice;
          }
        }

        const quantity = item.quantity || 1;

        orderItems.push({
          product: product._id,
          quantity: quantity,
          price: finalPrice,
          bargain: item.bargainId,
        });

        totalAmount += finalPrice * quantity;
      } catch (err) {
        return res.status(400).json({ message: `Invalid product ID: ${item.product}` });
      }
    }

    // Handle bargain request
    let bargainRequest = null;
    let orderStatus = "pending";
    
    // If user proposed a price for the whole order
    if (proposedPrice && parseFloat(proposedPrice) > 0 && parseFloat(proposedPrice) < totalAmount) {
      // Create a bargain request for the entire order
      const bargainData = {
        user: userId,
        originalPrice: totalAmount,
        proposedPrice: parseFloat(proposedPrice),
        items: items.map(item => ({ productId: item.product, quantity: item.quantity })),
        status: "pending"
      };
      
      bargainRequest = await Bargain.create(bargainData);
      orderStatus = "awaiting_bargain_approval"; // Mark order as awaiting bargain approval
    }

    // Use either address or shippingAddress
    const addressData = shippingAddress || address || {};

    // Generate order number
    const count = await Order.countDocuments();
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const orderNumber = `ORD-${dateStr}-${count + 1}`;

    const order = new Order({
      user: userId,
      orderNumber: orderNumber,
      items: orderItems,
      totalAmount,
      bargainRequest: bargainRequest ? bargainRequest._id : null,
      proposedTotal: proposedPrice ? parseFloat(proposedPrice) : null,
      status: orderStatus,
      shippingAddress: {
        street: addressData.street || "",
        city: addressData.city || "",
        state: addressData.state || "",
        zipCode: addressData.zipCode || "",
        country: addressData.country || "Nepal"
      },
      paymentMethod,
      notes,
      contactInfo: {
        fullName: fullName || "",
        email: email || "",
        phone: phone || ""
      }
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    if (error.code === 11000 && error.keyPattern && error.keyPattern.orderNumber) {
      return res.status(500).json({ message: "Error generating unique order number. Please try again." });
    }
    res.status(500).json({ message: "Error creating order. Please try again." });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price images")
      .populate("items.bargain", "proposedPrice status")
      .populate("bargainRequest", "proposedPrice status adminResponse")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      user: req.user._id,
      $or: [
        { status: { $ne: 'awaiting_bargain_approval' } },
        { 
          status: 'awaiting_bargain_approval',
          'bargainRequest.status': { $ne: 'rejected' }
        }
      ]
    })
      .populate("items.product", "name price images")
      .populate("items.bargain", "proposedPrice status")
      .populate("bargainRequest", "proposedPrice status adminResponse")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Error fetching user's orders" });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Error updating order status" });
  }
};

// Update payment status (admin only)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({ message: "Error updating payment status" });
  }
};

// Get a specific order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate("items.product", "name price images")
      .populate("bargainRequest", "proposedPrice status adminResponse")
      .populate("user", "name email");
      
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if user is authorized to view this order
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to access this order" });
    }
    
    res.json(order);
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ message: "Error fetching order details" });
  }
};

// Update payment method
exports.updatePaymentMethod = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod } = req.body;

    // Validate payment method
    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    // Update payment information
    order.paymentMethod = paymentMethod;
    order.paymentSelected = true;
    order.paymentSelectedAt = new Date();
    
    await order.save();

    res.json(order);
  } catch (error) {
    console.error("Update payment method error:", error);
    res.status(500).json({ message: "Error updating payment method" });
  }
}; 