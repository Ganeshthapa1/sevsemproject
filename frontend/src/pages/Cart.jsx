import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  IconButton,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Snackbar
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, loading, error, fetchCart, updateCartItem, removeFromCart } = useCart();
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  const calculateTotal = () => {
    if (!cart || !cart.items || cart.items.length === 0) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setOperationLoading(true);
    setOperationError("");
    
    try {
      console.log('Updating quantity for product:', productId, 'to', newQuantity);
      const success = await updateCartItem(productId, newQuantity);
      if (success) {
        setSuccessMessage("Cart updated successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setOperationError("Failed to update quantity");
      }
    } catch (err) {
      console.error("Error updating cart:", err);
      setOperationError("Failed to update quantity");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    setOperationLoading(true);
    setOperationError("");
    
    try {
      console.log('Removing product from cart:', productId);
      const success = await removeFromCart(productId);
      if (success) {
        setSuccessMessage("Item removed from cart");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setOperationError("Failed to remove item");
      }
    } catch (err) {
      console.error("Error removing item:", err);
      setOperationError("Failed to remove item");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const isCartEmpty = !cart || !cart.items || cart.items.length === 0;

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
          onClick={fetchCart} 
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  if (operationError) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{operationError}</Alert>
        <Button 
          variant="contained" 
          onClick={fetchCart} 
          sx={{ mt: 2 }}
        >
          Reload Cart
        </Button>
      </Container>
    );
  }

  if (isCartEmpty) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {cart.items.map((item) => (
            <Card key={item.product._id} sx={{ mb: 2, display: 'flex' }}>
              <CardMedia
                component="img"
                sx={{ width: 140, objectFit: 'cover' }}
                image={item.product.images && item.product.images.length > 0
                  ? item.product.images[0]
                  : '/placeholder-image.jpg'}
                alt={item.product.name}
              />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography component="div" variant="h6">
                    {item.product.name}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Rs. {item.product.price.toLocaleString()}
                  </Typography>
                </CardContent>
                
                <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, pb: 2 }}>
                  <IconButton 
                    onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                    disabled={operationLoading || item.quantity <= 1}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    value={item.quantity}
                    InputProps={{ readOnly: true }}
                    size="small"
                    sx={{ width: 60, mx: 1 }}
                  />
                  <IconButton 
                    onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                    disabled={operationLoading}
                  >
                    <AddIcon />
                  </IconButton>
                  
                  <Box sx={{ flexGrow: 1 }} />
                  
                  <Typography variant="subtitle1" sx={{ mr: 2 }}>
                    Rs. {(item.product.price * item.quantity).toLocaleString()}
                  </Typography>
                  
                  <IconButton 
                    color="error" 
                    onClick={() => handleRemoveItem(item.product._id)}
                    disabled={operationLoading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          ))}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal</Typography>
                <Typography>Rs. {calculateTotal().toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Shipping</Typography>
                <Typography>Free</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">Rs. {calculateTotal().toLocaleString()}</Typography>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCheckout}
              disabled={operationLoading || isCartEmpty}
            >
              {operationLoading ? <CircularProgress size={24} /> : 'Proceed to Checkout'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={!!successMessage}
        message={successMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
      />
    </Container>
  );
};

export default Cart;
