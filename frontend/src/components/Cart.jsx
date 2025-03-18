import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bargains, setBargains] = useState([]);
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

  const handleRemoveItem = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (error) {
      setError("Failed to remove item from cart");
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const getFinalPrice = (item) => {
    const acceptedBargain = bargains.find(
      (b) =>
        b.product._id === item.product._id &&
        b.status === "accepted"
    );
    return acceptedBargain ? acceptedBargain.proposedPrice : item.product.price;
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
        Shopping Cart
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cart.items.map((item) => {
              const finalPrice = getFinalPrice(item);
              const total = finalPrice * item.quantity;
              return (
                <TableRow key={item.product._id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell>
                    ${finalPrice}
                    {finalPrice !== item.product.price && (
                      <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                        (Bargain accepted)
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${total}</TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveItem(item.product._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Paper sx={{ p: 2, minWidth: 300 }}>
          <Typography variant="h6" gutterBottom>
            Order Summary
          </Typography>
          <Typography variant="body1" gutterBottom>
            Total Amount: ${totalAmount}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default Cart; 