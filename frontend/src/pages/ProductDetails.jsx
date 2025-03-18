import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Paper,
  Skeleton,
  Rating,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedIcon from "@mui/icons-material/Verified";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import LoginIcon from "@mui/icons-material/Login";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setOpenLoginDialog(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/cart/add`,
        {
          productId: product._id,
          quantity: quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSnackbar({
        open: true,
        message: "Product added to cart successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      setSnackbar({
        open: true,
        message: "Failed to add product to cart. Please try again.",
        severity: "error",
      });
    }
  };

  const handleLoginRedirect = () => {
    setOpenLoginDialog(false);
    navigate("/login", { state: { from: location.pathname } });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={100} />
            <Skeleton variant="rectangular" height={50} width={200} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container>
        <Typography variant="h5" color="error" sx={{ py: 4 }}>
          Product not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <img
              src={`${API_URL}${product.imageUrl}`}
              alt={product.name}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "500px",
                objectFit: "contain",
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Rating value={product.rating || 4.5} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({product.numReviews || 24} reviews)
              </Typography>
            </Box>

            <Typography
              variant="h4"
              color="primary"
              gutterBottom
              sx={{ fontWeight: "bold", mb: 3 }}
            >
              Rs. {product.price.toLocaleString()}
            </Typography>

            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              {product.description}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <LocalShippingIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">Free Delivery</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <VerifiedIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">Genuine Product</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AssignmentReturnIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">7-Day Returns</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField
                    type="number"
                    label="Quantity"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    inputProps={{ min: 1, max: product.stock }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCartIcon />}
                    sx={{ px: 4, py: 1.5 }}
                    fullWidth
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Product Specifications
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Category" secondary={product.category} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Stock Status"
                  secondary={
                    product.stock > 0
                      ? `${product.stock} units in stock`
                      : "Out of Stock"
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Material"
                  secondary={product.material || "High-quality material"}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Made In" secondary="Nepal" />
              </ListItem>
            </List>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Key Features
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Chip label="Handcrafted" />
                <Chip label="Authentic" />
                <Chip label="Traditional" />
                <Chip label="Premium Quality" />
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Dialog open={openLoginDialog} onClose={() => setOpenLoginDialog(false)}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <Typography>
            Please login to add items to your cart. Would you like to login now?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenLoginDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={handleLoginRedirect}
          >
            Login
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetails;
