import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Skeleton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  Stack,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const categories = [
  "All",
  "clothing",
  "Clothing",
  "electronics",
  "home",
  "fashion",
  "accessories",
  "art",
  "handicraft",
  "food",
];

const ProductGrid = ({ limit }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 10000]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log(`Fetching products from: ${API_URL}/products`);
        const response = await axios.get(`${API_URL}/products`);
        console.log('Products data:', response.data);
        
        const allProducts = response.data;
        setProducts(allProducts);
        
        // If limit is provided, limit the initial display
        const limitedProducts = limit ? allProducts.slice(0, limit) : allProducts;
        setFilteredProducts(limitedProducts);

        // Set initial price range based on products
        if (allProducts.length > 0) {
          const prices = allProducts.map((p) => p.price);
          const maxPrice = Math.ceil(Math.max(...prices, 1000));
          setPriceRange([0, maxPrice]);
        }

        setError(null);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limit]);

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Apply price range filter
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply limit if provided and not filtering
    if (limit && !searchTerm && selectedCategory === "All" && 
        priceRange[0] === 0 && priceRange[1] >= 1000) {
      filtered = filtered.slice(0, limit);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, priceRange, products, limit]);

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
            <Card>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  // If no products after loading completes
  if (products.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No products available at this time.
      </Alert>
    );
  }

  // For home page, just show products without filters
  if (limit) {
    return (
      <Grid container spacing={3}>
        {filteredProducts.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">No products match your filters.</Alert>
          </Grid>
        ) : (
          filteredProducts.map((product) => (
            <Grid item xs={6} sm={4} md={3} key={product._id}>
              <Card
                component={Link}
                to={`/product/${product._id}`}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  textDecoration: "none",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={product.images && product.images.length > 0 ? `${API_URL}${product.images[0]}` : '/placeholder-image.png'}
                  alt={product.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent>
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: "bold" }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {product.description.substring(0, 60)}...
                  </Typography>
                  <Typography variant="h6" color="primary">
                    Rs. {product.price}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    );
  }

  // For products page, show with filters
  return (
    <Grid container spacing={3}>
      {/* Filters Section - Left Side */}
      <Grid item xs={12} md={3}>
        <Paper elevation={3} sx={{ p: 3, position: "sticky", top: 20 }}>
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>

            {/* Search */}
            <TextField
              label="Search Products"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Category Filter */}
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Price Range Filter */}
            <Box>
              <Typography gutterBottom>Price Range</Typography>
              <Slider
                value={priceRange}
                onChange={handlePriceChange}
                valueLabelDisplay="auto"
                min={0}
                max={Math.max(10000, priceRange[1])}
                step={100}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>Rs. {priceRange[0]}</Typography>
                <Typography>Rs. {priceRange[1]}</Typography>
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Grid>

      {/* Products Grid - Right Side */}
      <Grid item xs={12} md={9}>
        <Grid container spacing={2}>
          {filteredProducts.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">No products match your filters.</Alert>
            </Grid>
          ) : (
            filteredProducts.map((product) => (
              <Grid item xs={6} sm={4} md={4} lg={3} key={product._id}>
                <Card
                  component={Link}
                  to={`/product/${product._id}`}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    textDecoration: "none",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.02)",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={product.images && product.images.length > 0 ? `${API_URL}${product.images[0]}` : '/placeholder-image.png'}
                    alt={product.name}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="subtitle1"
                      component="div"
                      sx={{ fontWeight: "bold" }}
                    >
                      {product.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {product.description.substring(0, 60)}...
                    </Typography>
                    <Typography variant="h6" color="primary">
                      Rs. {product.price}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ProductGrid;
