import React from "react";
import { Link } from "react-router-dom";
import { Button, Box, Typography, Container, Grid, Card, CardContent, CardMedia, CardActions } from "@mui/material";
import Carousel from "../components/Carousel";
import ProductGrid from "../components/ProductGrid";

const Home = () => {
  return (
    <div>
      <Carousel />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Welcome to Our Store
        </Typography>
        
        {/* Developer Tools Section - Only visible in development */}
        {import.meta.env.DEV && (
          <Box sx={{ mb: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Developer Tools</Typography>
            <Button 
              component={Link} 
              to="/esewa-test" 
              variant="contained"
              color="secondary"
              sx={{ mr: 2, mb: 1 }}
            >
              eSewa Test Form
            </Button>
            <Typography variant="caption" display="block" color="text.secondary">
              These tools are only visible in development mode
            </Typography>
          </Box>
        )}
        
        <ProductGrid limit={8} />
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            component={Link} 
            to="/products" 
            variant="contained" 
            color="primary"
            size="large"
          >
            View All Products
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default Home;
