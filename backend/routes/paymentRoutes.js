const express = require("express");
const router = express.Router();
const { protect: auth } = require("../middleware/authMiddleware");
const { 
    initEsewaPayment, 
    esewaPaymentSuccess, 
    esewaPaymentFailure,
    verifyEsewaPayment
} = require("../controllers/paymentController");

// Initialize eSewa payment (requires authentication)
router.post("/esewa/init", auth, initEsewaPayment);

// eSewa callback endpoints (public)
router.get("/esewa/success", esewaPaymentSuccess);
router.get("/esewa/failure", esewaPaymentFailure);

// Verify payment (requires authentication)
router.post("/esewa/verify", auth, verifyEsewaPayment);

// Debug endpoint for environment variables
router.get("/config/info", (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    esewa: {
      gateway: process.env.ESEWA_GATEWAY_URL,
      productCode: process.env.ESEWA_PRODUCT_CODE,
      // Don't expose the secret key in production
      secretKeyAvailable: !!process.env.ESEWA_SECRET_KEY
    },
    urls: {
      backend: process.env.BACKEND_URL,
      frontend: process.env.FRONTEND_URL
    }
  });
});

module.exports = router; 