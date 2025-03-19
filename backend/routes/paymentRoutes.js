const express = require("express");
const router = express.Router();
const { protect: auth } = require("../middleware/authMiddleware");
const { 
    initEsewaPayment, 
    esewaPaymentSuccess, 
    esewaPaymentFailure,
    verifyEsewaPayment,
    generateEsewaSignature
} = require("../controllers/paymentController");

// Initialize eSewa payment (requires authentication)
router.post("/esewa/init", auth, initEsewaPayment);

// eSewa callback endpoints (public)
router.get("/esewa/success", esewaPaymentSuccess);
router.get("/esewa/failure", esewaPaymentFailure);

// Verify payment (requires authentication)
router.post("/esewa/verify", auth, verifyEsewaPayment);

// Test endpoint for eSewa signature verification
router.post("/esewa/test-signature", (req, res) => {
  try {
    // Get data from request body
    const { total_amount, transaction_uuid, product_code } = req.body;
    
    if (!total_amount || !transaction_uuid || !product_code) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields for signature generation"
      });
    }
    
    // Create test data object
    const testData = {
      total_amount,
      transaction_uuid,
      product_code
    };
    
    // Generate signature
    const signature = generateEsewaSignature(testData);
    
    // Return signature and data
    res.json({
      success: true,
      testData,
      signature,
      fullData: {
        ...testData,
        signature,
        product_service_charge: "0",
        product_delivery_charge: "0",
        tax_amount: "0",
        amount: total_amount,
        success_url: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/payments/esewa/success`,
        failure_url: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/payments/esewa/failure`,
        signed_field_names: "total_amount,transaction_uuid,product_code"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

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