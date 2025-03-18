import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Button, Rating } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

const StyledCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled(CardMedia)`
  padding-top: 100%; // 1:1 Aspect ratio
  position: relative;
`;

const PriceTag = styled(Box)`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
`;

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/products/${product._id}`);
  };

  // Handle products with no images or multiple images
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0]
    : '/placeholder-image.jpg';

  return (
    <StyledCard>
      <Box sx={{ position: 'relative' }}>
        <ProductImage
          image={imageUrl}
          title={product.name}
          onClick={handleClick}
          sx={{ cursor: 'pointer' }}
        />
        <PriceTag>${product.price.toFixed(2)}</PriceTag>
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          <Typography 
            gutterBottom 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              height: '60px'
            }}
          >
            {product.name}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              height: '40px'
            }}
          >
            {product.description}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {product.category}
          </Typography>
          <Typography 
            variant="body2" 
            color={product.stock > 0 ? "success.main" : "error.main"}
            sx={{ fontWeight: 'bold' }}
          >
            {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          fullWidth 
          sx={{ mt: 2 }}
          onClick={handleClick}
          disabled={product.stock <= 0}
        >
          View Details
        </Button>
      </CardContent>
    </StyledCard>
  );
};

export default ProductCard; 