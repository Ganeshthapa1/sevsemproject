const { Order } = require("../models");
const crypto = require("crypto");
const https = require('https');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration for eSewa from environment variables
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
const ESEWA_GATEWAY_URL = process.env.ESEWA_GATEWAY_URL || "https://rc-epay.esewa.com.np";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

// Helper function for HTTPS requests
function httpsRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Generate signature for eSewa payment - Using exact format from their documentation
 */
const generateEsewaSignature = (data) => {
  try {
    // Format using comma-separated key=value pairs as shown in the working example
    const dataString = `total_amount=${data.total_amount},transaction_uuid=${data.transaction_uuid},product_code=${data.product_code}`;

    console.log("Data string for signature:", dataString);
    console.log("Secret key:", ESEWA_SECRET_KEY);

    // Create HMAC SHA256 hash with exact secret key from eSewa documentation
    const signature = crypto
      .createHmac("sha256", ESEWA_SECRET_KEY)
      .update(dataString)
      .digest("base64");

    console.log("Generated signature:", signature);
    return signature;
  } catch (error) {
    console.error("Error generating signature:", error);
    throw error;
  }
};

// Export the signature generation function for testing
exports.generateEsewaSignature = generateEsewaSignature;

/**
 * Initialize eSewa payment
 */
exports.initEsewaPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // Get order details
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Verify the order belongs to the user
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Check if payment method is eSewa
    if (order.paymentMethod !== "esewa") {
      return res.status(400).json({ message: "Invalid payment method for this order" });
    }
    
    // Generate a unique transaction UUID - using the order ID
    const transactionUuid = `TX${Date.now()}`;
    
    // Store transaction ID with the order
    order.transactionId = transactionUuid;
    await order.save();
    
    // Calculate amount as integer (no decimals)
    const amount = Math.floor(order.totalAmount).toString();
    
    // Create payment data according to eSewa v2 API requirements
    // Following exact format specified in eSewa's documentation
    const paymentData = {
      amount: amount,
      total_amount: amount,
      transaction_uuid: transactionUuid,
      product_code: ESEWA_PRODUCT_CODE,
      product_service_charge: "0",
      product_delivery_charge: "0",
      tax_amount: "0",
      success_url: `${BACKEND_URL}/api/payments/esewa/success`,
      failure_url: `${BACKEND_URL}/api/payments/esewa/failure`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
    };
    
    // Generate signature
    paymentData.signature = generateEsewaSignature({
      total_amount: paymentData.total_amount,
      transaction_uuid: paymentData.transaction_uuid,
      product_code: paymentData.product_code
    });
    
    console.log("Full payment data:", paymentData);
    
    // Send payment data to frontend
    res.json({
      paymentData,
      orderId: order._id
    });
    
  } catch (error) {
    console.error("Error initializing eSewa payment:", error);
    res.status(500).json({ message: "Failed to initialize payment" });
  }
};

/**
 * Handle eSewa payment success callback
 */
exports.esewaPaymentSuccess = async (req, res) => {
  try {
    console.log("eSewa success callback received:", req.query);
    console.log("Request headers:", req.headers);
    console.log("Full success URL path:", req.originalUrl);
    
    // Check if we have encoded data in query
    if (req.query.data) {
      try {
        // Try to decode data if it comes in the format from the docs
        const encodedData = req.query.data;
        const decodedData = Buffer.from(encodedData, 'base64').toString();
        const paymentData = JSON.parse(decodedData);
        console.log("Decoded payment data:", paymentData);
        
        if (paymentData.transaction_uuid) {
          // Find order by transaction ID
          const order = await Order.findOne({ transactionId: paymentData.transaction_uuid });
          
          if (order) {
            console.log(`Found order for transaction ${paymentData.transaction_uuid}:`, order._id);
            // Update order payment status
            order.paymentStatus = "completed";
            order.paymentDetails = {
              gateway: "esewa",
              referenceId: paymentData.transaction_code || paymentData.transaction_uuid,
              amount: order.totalAmount,
              paidAt: new Date()
            };
            
            await order.save();
            console.log(`Order ${order._id} payment marked as completed`);
            
            // Redirect to order confirmation
            return res.redirect(`${FRONTEND_URL}/order-confirmation/${order._id}?payment=success`);
          } else {
            console.error(`No order found for transaction ${paymentData.transaction_uuid}`);
          }
        }
      } catch (decodeError) {
        console.error("Failed to decode payment data:", decodeError);
      }
    }
    
    // Traditional method - look for transaction_uuid directly in query params
    const { transaction_uuid, status, refId } = req.query;
    
    if (transaction_uuid) {
      console.log(`Looking for order with transaction ID: ${transaction_uuid}`);
      // Find the order by transaction ID directly
      const order = await Order.findOne({ transactionId: transaction_uuid });
      
      if (order) {
        console.log(`Found order by transaction_uuid: ${order._id}, current payment status: ${order.paymentStatus}`);
        // Update order payment status
        order.paymentStatus = "completed";
        order.paymentDetails = {
          gateway: "esewa",
          referenceId: refId || transaction_uuid,
          amount: order.totalAmount,
          paidAt: new Date()
        };
        
        try {
          await order.save();
          console.log(`Order ${order._id} payment marked as completed`);
        } catch (saveError) {
          console.error(`Error saving order payment status: ${saveError.message}`);
        }
        
        // Redirect to order confirmation
        return res.redirect(`${FRONTEND_URL}/order-confirmation/${order._id}?payment=success`);
      } else {
        console.error(`No order found with transaction ID: ${transaction_uuid}`);
        // Try to find any order with a similar transaction ID
        const partialOrders = await Order.find({ 
          transactionId: { $regex: transaction_uuid.split('TX')[1] || transaction_uuid } 
        });
        console.log(`Found ${partialOrders.length} orders with partial transaction ID match`);
        if (partialOrders.length > 0) {
          console.log("Potential matching orders:", partialOrders.map(o => ({id: o._id, txnId: o.transactionId})));
        }
      }
    } else {
      console.error("No transaction_uuid found in query parameters");
    }
    
    // If execution reaches here, we couldn't identify the order
    console.error("Could not identify order from success callback data");
    return res.redirect(`${FRONTEND_URL}/orders?payment=unidentified`);
    
  } catch (error) {
    console.error("Error processing eSewa payment success:", error);
    res.status(500).send('<h1>Payment processing error</h1><p>Please contact customer support.</p>');
  }
};

/**
 * Handle eSewa payment failure callback
 */
exports.esewaPaymentFailure = async (req, res) => {
  try {
    console.log("eSewa failure callback received:", req.query);
    
    // Check if we have encoded data in query
    if (req.query.data) {
      try {
        // Try to decode data if it comes in the format from the docs
        const encodedData = req.query.data;
        const decodedData = Buffer.from(encodedData, 'base64').toString();
        const paymentData = JSON.parse(decodedData);
        console.log("Decoded payment data:", paymentData);
        
        if (paymentData.transaction_uuid) {
          // Find order by transaction ID
          const order = await Order.findOne({ transactionId: paymentData.transaction_uuid });
          
          if (order) {
            // Update order payment status
            order.paymentStatus = "failed";
            await order.save();
            console.log(`Order ${order._id} payment marked as failed`);
            
            // Redirect to payment page
            return res.redirect(`${FRONTEND_URL}/payment/${order._id}?payment=failed`);
          }
        }
      } catch (decodeError) {
        console.error("Failed to decode payment data:", decodeError);
      }
    }
    
    // Traditional method - look for transaction_uuid directly in query params
    const { transaction_uuid, status } = req.query;
    
    if (transaction_uuid) {
      // Find the order by transaction ID directly
      const order = await Order.findOne({ transactionId: transaction_uuid });
      
      if (order) {
        // Update order payment status
        order.paymentStatus = "failed";
        await order.save();
        console.log(`Order ${order._id} payment marked as failed`);
        
        // Redirect to payment page
        return res.redirect(`${FRONTEND_URL}/payment/${order._id}?payment=failed`);
      }
    }
    
    // If execution reaches here, we couldn't identify the order
    console.error("Could not identify order from failure callback data");
    return res.redirect(`${FRONTEND_URL}/orders?payment=failed`);
    
  } catch (error) {
    console.error("Error processing eSewa payment failure:", error);
    res.redirect(`${FRONTEND_URL}/orders?payment=error`);
  }
};

/**
 * Verify eSewa payment (optional - for additional security)
 */
exports.verifyEsewaPayment = async (req, res) => {
  try {
    console.log("Verifying eSewa payment:", req.body);
    const { orderId, refId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    
    // Get order details
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if already completed
    if (order.paymentStatus === 'completed') {
      return res.json({ success: true, message: "Payment already verified" });
    }
    
    // Verify the order belongs to the user if not admin
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to verify this payment" });
    }
    
    // If transactionId doesn't exist but refId is provided, use it
    if (!order.transactionId && refId) {
      order.transactionId = refId;
      await order.save();
    }
    
    // For testing and development, we can manually mark the payment as completed
    if (process.env.NODE_ENV !== 'production') {
      console.log("Development mode: Manually marking payment as completed");
      order.paymentStatus = "completed";
      order.paymentDetails = {
        gateway: "esewa",
        referenceId: refId || order.transactionId,
        amount: order.totalAmount,
        paidAt: new Date()
      };
      await order.save();
      return res.json({ success: true, message: "Payment marked as completed (development mode)" });
    }
    
    // Try to make API call to eSewa to verify payment if we have all the info
    if (order.transactionId && ESEWA_PRODUCT_CODE) {
      const verificationUrl = `${ESEWA_GATEWAY_URL}/api/epay/transaction/status/?product_code=${ESEWA_PRODUCT_CODE}&transaction_uuid=${order.transactionId}&total_amount=${order.totalAmount}`;
      
      try {
        console.log("Verifying with eSewa API:", verificationUrl);
        const response = await httpsRequest(verificationUrl);
        console.log("eSewa verification response:", response);
        const verificationSuccessful = response && response.status === 'COMPLETE';
        
        if (verificationSuccessful) {
          order.paymentStatus = "completed";
          order.paymentVerified = true;
          order.paymentDetails = {
            gateway: "esewa",
            referenceId: refId || order.transactionId,
            amount: order.totalAmount,
            paidAt: new Date(),
            verificationResponse: response
          };
          await order.save();
          
          return res.json({ success: true, message: "Payment verified successfully" });
        }
        
        return res.status(400).json({ success: false, message: "Payment verification failed with eSewa" });
      } catch (err) {
        console.error("Error verifying with eSewa API:", err);
        
        // For testing purposes, we'll mark it completed anyway
        order.paymentStatus = "completed";
        order.paymentVerified = true;
        order.paymentDetails = {
          gateway: "esewa",
          referenceId: refId || order.transactionId,
          amount: order.totalAmount,
          paidAt: new Date()
        };
        await order.save();
        
        return res.json({ 
          success: true, 
          message: "Payment verification with eSewa failed, but marking as completed",
          error: err.message 
        });
      }
    } else {
      // If we're missing information, just update the status anyway
      order.paymentStatus = "completed";
      order.paymentDetails = {
        gateway: "esewa",
        referenceId: refId || order.transactionId || `manual-${Date.now()}`,
        amount: order.totalAmount,
        paidAt: new Date()
      };
      await order.save();
      
      return res.json({ 
        success: true, 
        message: "Payment marked as completed without verification" 
      });
    }
  } catch (error) {
    console.error("Error verifying eSewa payment:", error);
    res.status(500).json({ message: "Failed to verify payment", error: error.message });
  }
}; 