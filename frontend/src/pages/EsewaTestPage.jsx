import React from 'react';
import { Container, Typography, Box, Button, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import EsewaDirectTestForm from '../components/EsewaDirectTestForm';

const EsewaTestPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          eSewa Payment Testing
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This page provides tools to test and debug eSewa payment integration.
        </Typography>
        <Button 
          component={Link} 
          to="/"
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <EsewaDirectTestForm />
      
      <Box sx={{ mt: 4, p: 3, bgcolor: '#f8f8f8', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Debugging Tips
        </Typography>
        <Typography variant="body2" paragraph>
          1. If you get a "Invalid payload signature" error (ES104), make sure the signature is generated correctly 
          using the exact format required by eSewa.
        </Typography>
        <Typography variant="body2" paragraph>
          2. The signature must be based on exactly: total_amount + transaction_uuid + product_code
        </Typography>
        <Typography variant="body2" paragraph>
          3. Make sure all required fields are properly URL encoded when submitted.
        </Typography>
        <Typography variant="body2" paragraph>
          4. The success_url and failure_url must be valid and accessible from eSewa's servers.
        </Typography>
        <Typography variant="body2" paragraph>
          5. Use the test credentials provided for successful testing in the sandbox environment.
        </Typography>
      </Box>
    </Container>
  );
};

export default EsewaTestPage; 