import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Divider,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const orderSteps = [
  {
    label: "Order Placed",
    description: "Your order has been confirmed and is being processed",
    icon: PendingIcon,
  },
  {
    label: "Packaging",
    description: "Your items are being carefully packaged",
    icon: InventoryIcon,
  },
  {
    label: "Shipping",
    description: "Your order is on its way",
    icon: LocalShippingIcon,
  },
  {
    label: "Delivered",
    description: "Your order has been delivered",
    icon: CheckCircleIcon,
  },
];

const OrderTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const orderId = location.state?.orderId;
    if (!orderId) {
      navigate("/");
      return;
    }
    fetchOrder(orderId);

    // Poll for order status updates every 30 seconds
    const intervalId = setInterval(() => {
      fetchOrder(orderId);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [location.state, navigate]);

  const fetchOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Failed to load order details");
      setLoading(false);
    }
  };

  const getStepStatus = (stepIndex) => {
    if (!order) return "inactive";

    const statusMap = {
      pending: 0,
      packaging: 1,
      shipping: 2,
      delivered: 3,
    };

    const currentStepIndex = statusMap[order.status] || 0;

    if (stepIndex < currentStepIndex) return "completed";
    if (stepIndex === currentStepIndex) return "active";
    return "inactive";
  };

  const getEstimatedDelivery = () => {
    if (!order) return "";
    // Add 3-5 days to order date for estimated delivery
    const orderDate = new Date(order.createdAt);
    const minDelivery = new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    const maxDelivery = new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000);

    return `${minDelivery.toLocaleDateString()} - ${maxDelivery.toLocaleDateString()}`;
  };

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
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Track Your Order
        </Typography>

        <Box sx={{ my: 4 }}>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Order ID
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {order._id}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Estimated Delivery
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {getEstimatedDelivery()}
              </Typography>
            </Grid>
          </Grid>

          <Stepper
            activeStep={orderSteps.findIndex(
              (step) => step.label.toLowerCase() === order.status
            )}
            alternativeLabel
          >
            {orderSteps.map((step, index) => {
              const status = getStepStatus(index);
              const StepIcon = step.icon;

              return (
                <Step key={step.label} completed={status === "completed"}>
                  <StepLabel
                    StepIconComponent={() => (
                      <StepIcon
                        color={status === "inactive" ? "disabled" : "primary"}
                        sx={{ fontSize: 30 }}
                      />
                    )}
                  >
                    <Typography
                      variant="body2"
                      color={
                        status === "inactive"
                          ? "text.secondary"
                          : "text.primary"
                      }
                      sx={{
                        fontWeight: status === "active" ? "bold" : "normal",
                      }}
                    >
                      {step.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      {step.description}
                    </Typography>
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Delivery Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Shipping Address
              </Typography>
              <Typography variant="body2">{order.fullName}</Typography>
              <Typography variant="body2">{order.address.street}</Typography>
              <Typography variant="body2">
                {order.address.city}, {order.address.state}{" "}
                {order.address.zipCode}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Contact Information
              </Typography>
              <Typography variant="body2">Phone: {order.phone}</Typography>
              <Typography variant="body2">Email: {order.email}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderTracking;
