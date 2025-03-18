const express = require("express");
const router = express.Router();
const { User, Order } = require("../models");
const { protect, admin } = require("../middleware/authMiddleware");

// Get dashboard statistics
router.get("/stats", protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);
    const pendingDeliveries = await Order.countDocuments({
      status: { $in: ["pending", "packaging", "shipping"] },
    });

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingDeliveries,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Error fetching dashboard statistics" });
  }
});

// Get recent orders
router.get("/recent-orders", protect, admin, async (req, res) => {
  try {
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10);
    res.json(recentOrders);
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).json({ message: "Error fetching recent orders" });
  }
});

// Get orders by status
router.get("/orders-by-status", protect, admin, async (req, res) => {
  try {
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          value: 1,
          _id: 0,
        },
      },
    ]);
    res.json(ordersByStatus);
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    res.status(500).json({ message: "Error fetching orders by status" });
  }
});

// Get revenue by month
router.get("/revenue-by-month", protect, admin, async (req, res) => {
  try {
    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: {
                  if: { $lt: ["$_id.month", 10] },
                  then: { $concat: ["0", { $toString: "$_id.month" }] },
                  else: { $toString: "$_id.month" },
                },
              },
            ],
          },
          revenue: 1,
        },
      },
      {
        $sort: { month: 1 },
      },
      {
        $limit: 12,
      },
    ]);
    res.json(revenueByMonth);
  } catch (error) {
    console.error("Error fetching revenue by month:", error);
    res.status(500).json({ message: "Error fetching revenue data" });
  }
});

// Get orders by payment method
router.get("/orders-by-payment", protect, admin, async (req, res) => {
  try {
    const ordersByPayment = await Order.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          value: 1,
          _id: 0,
        },
      },
    ]);
    res.json(ordersByPayment);
  } catch (error) {
    console.error("Error fetching orders by payment:", error);
    res.status(500).json({ message: "Error fetching payment method data" });
  }
});

// Update admin profile
router.put("/profile", protect, admin, async (req, res) => {
  console.log("PUT /profile request received");
  console.log("Request body:", req.body);
  console.log("Request user:", req.user);
  try {
    const { name, email, phone } = req.body;
    const userId = req.user._id; // Get user ID from authenticated user object.

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update only if values are provided in the request body.  Prevents accidental overwriting.
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    const updatedUser = await user.save();

    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update profile" });
    }

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ message: `Error updating profile: ${error.message}` });
  }
});

module.exports = router;
