import React from 'react';
import { Box, Button, TextField, Typography, Paper, Grid } from '@mui/material';

/**
 * A simple eSewa payment form component for direct testing
 */
const EsewaPaymentForm = () => {
  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', my: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        eSewa Payment Test Form
      </Typography>
      
      <form action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" method="POST">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount"
              name="amount"
              defaultValue="100"
              required
              helperText="Main amount"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tax Amount"
              name="tax_amount"
              defaultValue="10"
              required
              helperText="Tax amount"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Total Amount"
              name="total_amount"
              defaultValue="110"
              required
              helperText="Total amount (amount + tax)"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Transaction UUID"
              name="transaction_uuid"
              defaultValue={`TEST-${Date.now()}`}
              required
              helperText="Unique transaction ID"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Product Code"
              name="product_code"
              defaultValue="EPAYTEST"
              required
              helperText="Merchant code"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Service Charge"
              name="product_service_charge"
              defaultValue="0"
              required
              helperText="Service charge"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Delivery Charge"
              name="product_delivery_charge"
              defaultValue="0"
              required
              helperText="Delivery charge"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Success URL"
              name="success_url"
              defaultValue="https://developer.esewa.com.np/success"
              required
              helperText="Redirect URL on successful payment"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Failure URL"
              name="failure_url"
              defaultValue="https://developer.esewa.com.np/failure"
              required
              helperText="Redirect URL on failed payment"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Signed Field Names"
              name="signed_field_names"
              defaultValue="total_amount,transaction_uuid,product_code"
              required
              helperText="Fields used for signature"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Signature"
              name="signature"
              defaultValue="i94zsd3oXF6ZsSr/kGqT4sSzYQzjj1W/waxjWyRwaME="
              required
              helperText="HMAC signature (pre-computed for test)"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button 
              type="submit"
              variant="contained"
              color="success" 
              fullWidth
              sx={{ 
                backgroundColor: '#60BB46', 
                '&:hover': { backgroundColor: '#4d9936' },
                py: 1
              }}
            >
              Pay with eSewa
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default EsewaPaymentForm; 