import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  Button,
  Alert,
  CircularProgress,
  Chip
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  
  // Get data either from location state (direct from checkout) or use orderId to fetch
  const receivedOrder = location.state?.order;
  const orderId = id || location.state?.order?._id || location.state?.orderId;
  const isBargaining = location.state?.isBargaining;
  const paymentQueryParam = new URLSearchParams(location.search).get('payment');

  useEffect(() => {
    if (!orderId && !receivedOrder) {
      navigate('/');
      return;
    }

    // If we already have the order from location state, use it
    if (receivedOrder) {
      setOrder(receivedOrder);
      setLoading(false);
      
      // If this is likely an eSewa callback, check if we need to verify payment
      if (paymentQueryParam === 'success') {
        verifyEsewaPayment(receivedOrder._id);
      }
      
      return;
    }

    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // First try getting the specific order by ID
        try {
          const response = await axios.get(`${API_URL}/api/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setOrder(response.data);
          setLoading(false);
          
          // If this is likely an eSewa callback, check if we need to verify payment
          if (paymentQueryParam === 'success') {
            verifyEsewaPayment(response.data._id);
          }
        } catch (error) {
          console.error("Error fetching order by ID:", error);
          
          // Fallback: try getting all user orders and find this one
          try {
            const allOrdersResponse = await axios.get(`${API_URL}/api/orders/user`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            const foundOrder = allOrdersResponse.data.find(o => o._id === orderId);
            if (foundOrder) {
              setOrder(foundOrder);
              
              // If this is likely an eSewa callback, check if we need to verify payment
              if (paymentQueryParam === 'success') {
                verifyEsewaPayment(foundOrder._id);
              }
            } else {
              setError("Order not found. Please check your orders page.");
            }
            setLoading(false);
          } catch (fallbackError) {
            console.error("Error fetching all orders:", fallbackError);
            setError("Could not retrieve your order information.");
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Order confirmation error:", error);
        setError("Failed to retrieve order details");
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, receivedOrder, navigate, paymentQueryParam]);
  
  // Check for pending eSewa payment and verify it
  const verifyEsewaPayment = async (orderId) => {
    // Check if this order was recently initiated for eSewa payment
    const pendingOrderId = localStorage.getItem('esewa_pending_order_id');
    const pendingTransactionId = localStorage.getItem('esewa_pending_transaction_id');
    
    if (!pendingOrderId || !pendingTransactionId || orderId !== pendingOrderId) {
      return; // Not a pending eSewa payment we were tracking
    }
    
    setVerifyingPayment(true);
    
    try {
      const token = localStorage.getItem('token');
      // Call the verify endpoint to ensure payment status is updated
      const verifyResponse = await axios.post(
        `${API_URL}/api/payments/esewa/verify`,
        { 
          orderId: orderId,
          refId: pendingTransactionId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (verifyResponse.data.success) {
        // Refresh order details to get the updated payment status
        const refreshResponse = await axios.get(`${API_URL}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setOrder(refreshResponse.data);
        
        // Clear the pending payment info
        localStorage.removeItem('esewa_pending_order_id');
        localStorage.removeItem('esewa_pending_transaction_id');
        localStorage.removeItem('esewa_payment_timestamp');
      }
    } catch (error) {
      console.error("Error verifying eSewa payment:", error);
    } finally {
      setVerifyingPayment(false);
    }
  };
  
  // Get appropriate message based on order status
  const getConfirmationMessage = () => {
    if (!order) return "";
    
    if (order.status === 'awaiting_bargain_approval') {
      return (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="h6">Bargain Request Submitted</Typography>
            <Typography>
              Your bargain request has been sent to the seller. We'll notify you once it's reviewed.
            </Typography>
          </Alert>
          <Typography>
            You've proposed a price of <strong>${order.proposedTotal?.toFixed(2)}</strong> instead of the original ${order.totalAmount?.toFixed(2)}.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            You can check the status of your request in the Orders page.
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Thank You for Your Order!
        </Typography>
        <Typography>
          Your order has been placed and is being processed.
        </Typography>
        <Typography>
          Your order number is: <strong>{order.orderNumber || order._id}</strong>
        </Typography>
        {order.paymentStatus === 'completed' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography>Your payment has been completed successfully!</Typography>
          </Alert>
        )}
        {paymentQueryParam === 'success' && verifyingPayment && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
            <Typography sx={{ ml: 1 }}>Verifying payment...</Typography>
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Paper>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">
          {error || "No order information available. Please check your Orders page."}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => navigate("/orders")}
        >
          Go to Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        {getConfirmationMessage()}

        {order && (
          <>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Order Details
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <Chip
                    label={order.status.replace(/_/g, " ").toUpperCase()}
                    color={
                      order.status === "awaiting_bargain_approval"
                        ? "warning"
                        : order.status === "delivered"
                        ? "success"
                        : order.status === "cancelled"
                        ? "error"
                        : "primary"
                    }
                    size="small"
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Status:
                  </Typography>
                  <Chip
                    label={order.paymentStatus?.toUpperCase() || "PENDING"}
                    color={
                      order.paymentStatus === "completed"
                        ? "success"
                        : order.paymentStatus === "failed"
                        ? "error"
                        : "warning"
                    }
                    size="small"
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Date:
                  </Typography>
                  <Typography>
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
                {order.paymentMethod && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Method:
                    </Typography>
                    <Typography>{order.paymentMethod.toUpperCase()}</Typography>
                    {order.paymentStatus === "completed" && order.paymentDetails?.paidAt && (
                      <Typography variant="body2" color="text.secondary">
                        Paid on: {new Date(order.paymentDetails.paidAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>
                    )}
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Shipping Information
                </Typography>
                <Box>
                  <Typography>{order.contactInfo?.fullName}</Typography>
                  <Typography>{order.shippingAddress?.street}</Typography>
                  <Typography>
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state}{" "}
                    {order.shippingAddress?.zipCode}
                  </Typography>
                  <Typography>{order.shippingAddress?.country}</Typography>
                  <Typography>{order.contactInfo?.phone}</Typography>
                  <Typography>{order.contactInfo?.email}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Items Ordered
              </Typography>
              {order.items.map((item, index) => (
                <Paper
                  key={index}
                  variant="outlined"
                  sx={{ p: 2, mb: 2, display: "flex" }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">
                      {item.product?.name || "Product not available"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.quantity}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                </Paper>
              ))}

              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid #eee",
                  pt: 2,
                }}
              >
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">
                  ${order.totalAmount.toFixed(2)}
                </Typography>
              </Box>
              
              {order.proposedTotal && order.status === 'awaiting_bargain_approval' && (
                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    color: 'warning.main'
                  }}
                >
                  <Typography variant="subtitle1">Proposed Price:</Typography>
                  <Typography variant="subtitle1">
                    ${order.proposedTotal.toFixed(2)}
                  </Typography>
                </Box>
              )}
              
              {order.proposedTotal && order.bargainRequest?.status === 'accepted' && (
                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    color: 'success.main'
                  }}
                >
                  <Typography variant="subtitle1">Accepted Price:</Typography>
                  <Typography variant="subtitle1">
                    ${order.proposedTotal.toFixed(2)}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/orders")}
              >
                View All Orders
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default OrderConfirmation;
