import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Divider,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Import removed payment logos - no longer needed in checkout

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    proposedPrice: "",
    isBargaining: false
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    fetchCart();
    // Pre-fill user data
    setFormData((prev) => ({
      ...prev,
      fullName: user.name || "",
      email: user.email || "",
      phone: user.contactNo || "",
      address: user.address || prev.address,
    }));
  }, [navigate]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart items");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleBargainToggle = (e) => {
    setFormData({
      ...formData,
      isBargaining: e.target.checked,
      proposedPrice: e.target.checked ? formData.proposedPrice : ""
    });
  };

  // Calculate the total price of items in the cart
  const calculateTotal = () => {
    if (!cart || !cart.items.length) return 0;
    return cart.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty");
      setLoading(false);
      return;
    }

    try {
      // Prepare order data without payment method
      const orderData = {
        items: cart.items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress: formData.address,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      };
      
      // Add proposed price if the user is bargaining
      if (formData.isBargaining && formData.proposedPrice) {
        orderData.proposedPrice = formData.proposedPrice;
      }

      console.log("Sending order data:", orderData);
      
      // Create the order without payment info
      const response = await axios.post(`${API_URL}/api/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      console.log("Order response:", response.data);
      
      // Clear cart after successful order
      await axios.delete(`${API_URL}/api/cart/clear`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      // Navigate to order confirmation
      navigate("/order-confirmation", { 
        state: { 
          order: response.data, 
          isBargaining: formData.isBargaining 
        } 
      });
      
    } catch (error) {
      console.error("Error creating order:", error);
      setError(
        error.response?.data?.message || "Error placing order. Please try again."
      );
      setLoading(false);
    }
  };

  if (loading && !cart) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Delivery Information
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Street Address"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="City"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="State"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="ZIP Code"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </form>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bargain Option
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              You can propose a different price for your order. The admin will review your proposal and either accept or reject it.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Original Total: ${calculateTotal().toLocaleString()}
              </Typography>
              <TextField
                label="Your Proposed Price"
                type="number"
                size="small"
                value={formData.proposedPrice || ''}
                onChange={(e) => handleChange({ 
                  target: { 
                    name: 'proposedPrice', 
                    value: e.target.value 
                  } 
                })}
                InputProps={{
                  startAdornment: '$',
                }}
                sx={{ width: '200px' }}
              />
            </Box>
            <Alert severity="info">
              Note: Your order will be pending until the admin accepts your proposed price. If rejected, you'll need to pay the original price or cancel the order.
            </Alert>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bargain Option
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isBargaining}
                  onChange={handleBargainToggle}
                />
              }
              label="I want to bargain"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            {cart &&
              cart.items.map((item) => (
                <Box key={item.product._id} sx={{ mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {item.product.name} × {item.quantity}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body1" align="right">
                        Rs.{" "}
                        {(item.product.price * item.quantity).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography variant="subtitle1">Total</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle1" align="right">
                  Rs. {calculateTotal().toLocaleString()}
                </Typography>
              </Grid>
              {formData.proposedPrice && (
                <>
                  <Grid item xs={8}>
                    <Typography variant="subtitle1" color="primary">
                      Your Proposed Price
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="subtitle1" color="primary" align="right">
                      Rs. {parseFloat(formData.proposedPrice).toLocaleString()}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Processing..." : formData.proposedPrice ? "Submit Offer & Place Order" : "Place Order"}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
