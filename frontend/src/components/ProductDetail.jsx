import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Rating,
  Divider,
  Alert,
  CircularProgress,
  Snackbar
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import BargainDialog from "./BargainDialog";
import { useCart } from "../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bargainDialogOpen, setBargainDialogOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { addToCart } = useCart();

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product details from:', `${API_URL}/products/${id}`);
        const response = await axios.get(`${API_URL}/products/${id}`);
        console.log('Product details response:', response.data);
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError("Failed to load product details");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    setError("");
    
    try {
      const success = await addToCart(id, 1);
      if (success) {
        setSuccessMessage("Product added to cart!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Failed to add product to cart");
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError("Failed to add product to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  );
  
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!product) return <Typography>Product not found</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <img
            src={product.images && product.images.length > 0 
              ? product.images[0] 
              : '/placeholder-image.jpg'}
            alt={product.name}
            style={{ width: "100%", height: "auto", maxHeight: "500px", objectFit: "contain" }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            Rs. {product.price?.toLocaleString() || '0'}
          </Typography>
          <Rating value={product.rating || 0} readOnly />
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1" paragraph>
            {product.description}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddToCart}
              disabled={addingToCart}
              sx={{ mr: 2 }}
            >
              {addingToCart ? <CircularProgress size={24} /> : 'Add to Cart'}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setBargainDialogOpen(true)}
            >
              Make an Offer
            </Button>
          </Box>
        </Grid>
      </Grid>

      <BargainDialog
        open={bargainDialogOpen}
        onClose={() => setBargainDialogOpen(false)}
        product={product}
      />
      
      <Snackbar
        open={!!successMessage}
        message={successMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default ProductDetail; 