import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [bargains, setBargains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    paymentMethod: "cash",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    fetchBargains();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to load cart");
      setLoading(false);
    }
  };

  const fetchBargains = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/bargains/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBargains(response.data);
    } catch (error) {
      console.error("Failed to load bargains:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getFinalPrice = (item) => {
    const acceptedBargain = bargains.find(
      (b) =>
        b.product._id === item.product._id &&
        b.status === "accepted"
    );
    return acceptedBargain ? acceptedBargain.proposedPrice : item.product.price;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const orderData = {
        items: cart.items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: getFinalPrice(item),
          bargain: bargains.find(
            (b) =>
              b.product._id === item.product._id &&
              b.status === "accepted"
          )?._id,
        })),
        totalAmount: cart.items.reduce(
          (sum, item) => sum + getFinalPrice(item) * item.quantity,
          0
        ),
        shippingAddress: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        notes: "",
      };

      await axios.post(`${API_URL}/api/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Clear cart
      await axios.delete(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/order-confirmation");
    } catch (error) {
      setError("Failed to place order");
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!cart || cart.items.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Your cart is empty</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/products")}
          sx={{ mt: 2 }}
        >
          Continue Shopping
        </Button>
      </Box>
    );
  }

  const totalAmount = cart.items.reduce(
    (sum, item) => sum + getFinalPrice(item) * item.quantity,
    0
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Shipping Information
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Payment Method</FormLabel>
                    <RadioGroup
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                    >
                      <FormControlLabel
                        value="cash"
                        control={<Radio />}
                        label="Cash on Delivery"
                      />
                      <FormControlLabel
                        value="card"
                        control={<Radio />}
                        label="Credit Card"
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            {cart.items.map((item) => {
              const finalPrice = getFinalPrice(item);
              const total = finalPrice * item.quantity;
              return (
                <Box key={item.product._id} sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    {item.product.name} x {item.quantity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${finalPrice} each
                    {finalPrice !== item.product.price && (
                      <Typography
                        component="span"
                        variant="caption"
                        color="success.main"
                        sx={{ ml: 1 }}
                      >
                        (Bargain accepted)
                      </Typography>
                    )}
                  </Typography>
                  <Typography variant="body2">Total: ${total}</Typography>
                </Box>
              );
            })}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">
              Total Amount: ${totalAmount}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
              sx={{ mt: 2 }}
            >
              Place Order
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Checkout; 