import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useAuth } from "../context/AuthContext";

// Set the correct API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Define payment methods
const paymentMethods = [
  { id: "cod", name: "Cash on Delivery" },
  { id: "esewa", name: "eSewa" },
  { id: "khalti", name: "Khalti" },
  { id: "imepay", name: "IME Pay" }
];

// Row component for each order
const OrderRow = ({ order, onPaymentUpdate }) => {
  const [open, setOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'awaiting_bargain_approval':
        return 'warning';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (order) => {
    if (order.status === 'awaiting_bargain_approval') {
      return 'Awaiting Price Approval';
    }
    return order.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Function to handle opening the payment dialog
  const handlePaymentClick = () => {
    setPaymentDialogOpen(true);
  };
  
  // Function to submit the payment method
  const handlePaymentSubmit = async () => {
    setPaymentLoading(true);
    setPaymentError("");
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/orders/${order._id}/payment-method`,
        { 
          paymentMethod: selectedPaymentMethod
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setPaymentDialogOpen(false);
      // Call the parent's update function to refresh orders
      if (onPaymentUpdate) {
        onPaymentUpdate();
      }
    } catch (error) {
      console.error("Error setting payment method:", error);
      setPaymentError("Failed to set payment method. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };
  
  // Check if order should show payment button
  const showPaymentButton = order.status !== 'awaiting_bargain_approval' && 
                          order.status !== 'cancelled' && 
                          !order.paymentSelected;
                          
  // Check if order had a bargain request
  const hadBargain = order.bargainRequest && order.bargainRequest.status;
  const bargainAccepted = hadBargain && order.bargainRequest.status === 'accepted';

  // Add a function to manually verify a single payment
  const verifyEsewaPayment = async () => {
    try {
      setVerifyingPayment(true);
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/payments/verify`, {
        orderId: order._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh the orders list
      onPaymentUpdate();
    } catch (error) {
      console.error("Error verifying payment:", error);
    } finally {
      setVerifyingPayment(false);
    }
  };
  
  // Update the payment status cell to show verify button when needed
  const renderPaymentStatus = () => {
    if (showPaymentButton) {
      return (
        <Button 
          variant="contained" 
          color="primary" 
          size="small" 
          onClick={handlePaymentClick}
        >
          Choose Payment
        </Button>
      );
    } else if (order.paymentMethod) {
      return (
        <Box>
          <Chip 
            label={order.paymentMethod.toUpperCase()}
            color={order.paymentStatus === 'completed' ? 'success' : 'default'}
            size="small"
          />
          {order.paymentMethod === 'esewa' && order.paymentStatus !== 'completed' && (
            <>
              <Button 
                variant="outlined" 
                size="small" 
                color="primary"
                sx={{ ml: 1 }}
                onClick={() => window.location.href = `/payment/${order._id}`}
              >
                Pay Now
              </Button>
              <Button
                variant="text"
                size="small"
                color="secondary"
                sx={{ ml: 1 }}
                onClick={verifyEsewaPayment}
                disabled={verifyingPayment}
              >
                {verifyingPayment ? "Verifying..." : "Verify Payment"}
              </Button>
            </>
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{order.orderNumber || 'N/A'}</TableCell>
        <TableCell>{formatDate(order.createdAt)}</TableCell>
        <TableCell>
          {bargainAccepted ? (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                Rs. {order.totalAmount.toLocaleString()}
              </Typography>
              <Typography variant="body1" color="success.main">
                Rs. {order.proposedTotal?.toLocaleString() || ''}
              </Typography>
            </Box>
          ) : (
            `Rs. ${order.totalAmount.toLocaleString()}`
          )}
        </TableCell>
        <TableCell>
          <Chip 
            label={getStatusText(order)}
            color={getStatusColor(order.status)}
            size="small"
          />
        </TableCell>
        <TableCell>
          {renderPaymentStatus()}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                Order Details
              </Typography>
              
              {order.bargainRequest && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Price Negotiation
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Original Price:
                        </Typography>
                        <Typography variant="body1">
                          Rs. {order.totalAmount.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Your Proposed Price:
                        </Typography>
                        <Typography variant="body1">
                          Rs. {order.proposedTotal?.toLocaleString() || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Status:
                        </Typography>
                        <Chip 
                          label={order.bargainRequest?.status?.toUpperCase() || 'PENDING'}
                          color={
                            order.bargainRequest?.status === 'accepted' ? 'success' :
                            order.bargainRequest?.status === 'rejected' ? 'error' : 'warning'
                          }
                          size="small"
                        />
                      </Grid>
                      {order.bargainRequest?.adminResponse && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Admin Response:
                          </Typography>
                          <Paper sx={{ p: 1, mt: 1, bgcolor: order.bargainRequest.status === 'accepted' ? '#f0f9ef' : '#fbeded' }}>
                            <Typography variant="body2">
                              {order.bargainRequest.adminResponse}
                            </Typography>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Box>
              )}
              
              <Typography variant="subtitle1" gutterBottom>
                Items
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.product?.name || 'Product not available'}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell align="right">Rs. {item.price.toLocaleString()}</TableCell>
                      <TableCell align="right">Rs. {(item.price * item.quantity).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3}><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>Rs. {order.totalAmount.toLocaleString()}</strong></TableCell>
                  </TableRow>
                  {order.proposedTotal && order.bargainRequest?.status === 'accepted' && (
                    <TableRow>
                      <TableCell colSpan={3}><strong>Accepted Price</strong></TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        <strong>Rs. {order.proposedTotal.toLocaleString()}</strong>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Shipping Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      {order.contactInfo?.fullName}<br />
                      {order.shippingAddress?.street}<br />
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
                      {order.shippingAddress?.country}<br />
                      {order.contactInfo?.phone}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Method:
                    </Typography>
                    <Typography variant="body1">
                      {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'NOT SELECTED'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      
      {/* Payment Method Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
        <DialogTitle>Select Payment Method</DialogTitle>
        <DialogContent>
          {paymentError && <Alert severity="error" sx={{ mb: 2 }}>{paymentError}</Alert>}
          
          <FormControl component="fieldset" sx={{ mt: 1 }}>
            <RadioGroup
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            >
              {paymentMethods.map((method) => (
                <FormControlLabel
                  key={method.id}
                  value={method.id}
                  control={<Radio />}
                  label={method.name}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handlePaymentSubmit} 
            variant="contained" 
            color="primary"
            disabled={paymentLoading}
          >
            {paymentLoading ? <CircularProgress size={24} /> : "Confirm Payment Method"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const Orders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentSeverity, setPaymentSeverity] = useState("success");
  const [showVerifyButton, setShowVerifyButton] = useState(false);
  const [verifyingAllPayments, setVerifyingAllPayments] = useState(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState("");

  useEffect(() => {
    // Check for newly placed order
    if (location.state?.orderSuccess) {
      const orderNumber = location.state.orderNumber || location.state.orderId;
      if (location.state.isBargaining) {
        setOrderSuccessMessage(`Your order #${orderNumber} has been placed with a bargain request. The seller will review your price proposal soon.`);
      } else {
        setOrderSuccessMessage(`Your order #${orderNumber} has been successfully placed!`);
      }
      // Clear the state to prevent showing the message on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check for payment status in URL
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    if (paymentStatus) {
      switch (paymentStatus) {
        case 'success':
          setPaymentMessage("Payment completed successfully!");
          setPaymentSeverity("success");
          break;
        case 'failed':
          setPaymentMessage("Payment failed. Please try again.");
          setPaymentSeverity("error");
          break;
        case 'unidentified':
          setPaymentMessage("Payment received but order couldn't be identified automatically. Click 'Verify Payments' to check all pending orders.");
          setPaymentSeverity("warning");
          setShowVerifyButton(true);
          break;
        case 'manual-verification-needed':
          setPaymentMessage("Payment received but needs manual verification. Click 'Verify Payments' to check all your pending payments.");
          setPaymentSeverity("warning");
          setShowVerifyButton(true);
          break;
        default:
          setPaymentMessage("");
      }
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to verify all pending payments
  const verifyAllPendingPayments = async () => {
    try {
      setVerifyingAllPayments(true);
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/payments/verify-all-pending`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh orders list
      fetchOrders();
      setPaymentMessage("All pending payments have been verified!");
      setPaymentSeverity("success");
      setShowVerifyButton(false);
    } catch (error) {
      console.error('Error verifying payments:', error);
      setPaymentMessage("Failed to verify payments. Please contact support.");
      setPaymentSeverity("error");
    } finally {
      setVerifyingAllPayments(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          onClick={fetchOrders} 
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No Orders Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You haven't placed any orders yet.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="primary"
          >
            Start Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>

      {orderSuccessMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setOrderSuccessMessage("")}
        >
          {orderSuccessMessage}
        </Alert>
      )}

      {paymentMessage && (
        <Alert 
          severity={paymentSeverity} 
          sx={{ mb: 3 }}
          onClose={() => setPaymentMessage("")}
          action={
            showVerifyButton && (
              <Button 
                color="inherit" 
                size="small"
                disabled={verifyingAllPayments}
                onClick={verifyAllPendingPayments}
              >
                {verifyingAllPayments ? "Verifying..." : "Verify Payments"}
              </Button>
            )
          }
        >
          {paymentMessage}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <OrderRow key={order._id} order={order} onPaymentUpdate={fetchOrders} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Orders; 