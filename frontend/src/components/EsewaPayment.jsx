import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, CircularProgress, Alert, Paper, Divider } from '@mui/material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const EsewaPayment = ({ order, onError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [backendInfo, setBackendInfo] = useState(null);
  const formRef = React.useRef(null);
  const [debug, setDebug] = useState(true); // Debug mode on by default

  useEffect(() => {
    initializePayment();
  }, [order]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/payments/esewa/init`,
        { orderId: order._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Payment data received:", response.data);
      setPaymentData(response.data);
      setResponseData(response.data); // Store full response for debugging
      
      // Get backend info for debugging
      try {
        const infoResponse = await axios.get(`${API_URL}/api/payments/config/info`);
        setBackendInfo(infoResponse.data);
        console.log("Backend info:", infoResponse.data);
      } catch (infoErr) {
        console.error("Could not fetch backend info:", infoErr);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error initializing eSewa payment:', err);
      setResponseData(err.response?.data || err.message);
      setError('Failed to initialize payment. Please try again.');
      setLoading(false);
      if (onError) {
        onError('Failed to initialize payment');
      }
    }
  };

  const handlePayment = () => {
    if (formRef.current) {
      console.log("Submitting eSewa payment form...");
      console.log("Form data:", paymentData?.paymentData);
      
      // Log all form values for debugging
      const formData = new FormData(formRef.current);
      const formValues = {};
      for (let [key, value] of formData.entries()) {
        formValues[key] = value;
      }
      console.log("Form values:", formValues);
      
      // Submit the form
      formRef.current.submit();
    }
  };

  const toggleDebug = () => {
    setDebug(!debug);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ my: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        {debug && responseData && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: '#fff0f0', textAlign: 'left' }}>
            <Typography variant="subtitle2" gutterBottom>Error Data:</Typography>
            <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
              {JSON.stringify(responseData, null, 2)}
            </pre>
          </Paper>
        )}
        <Button variant="outlined" onClick={initializePayment}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center', my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Pay with eSewa
      </Typography>
      
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
        <Typography variant="body2" color="text.secondary">
          Total Amount: Rs. {paymentData?.paymentData.total_amount}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Transaction ID: {paymentData?.paymentData.transaction_uuid}
        </Typography>
        <Button 
          size="small" 
          variant="text" 
          color="primary" 
          onClick={toggleDebug}
          sx={{ mt: 1 }}
        >
          {debug ? "Hide Details" : "Show Details"}
        </Button>
      </Paper>
      
      {/* Debugging info */}
      {debug && paymentData && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5', textAlign: 'left' }}>
          <Typography variant="subtitle2" gutterBottom>Payment Data:</Typography>
          {Object.entries(paymentData.paymentData).map(([key, value]) => (
            <Typography key={key} variant="caption" display="block" sx={{ mb: 0.5 }}>
              <strong>{key}:</strong> {value}
            </Typography>
          ))}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>API Response:</Typography>
          <pre style={{ overflow: 'auto', maxHeight: '150px', fontSize: '0.7rem' }}>
            {JSON.stringify(responseData, null, 2)}
          </pre>
          
          {backendInfo && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>Backend Environment:</Typography>
              <pre style={{ overflow: 'auto', maxHeight: '150px', fontSize: '0.7rem' }}>
                {JSON.stringify(backendInfo, null, 2)}
              </pre>
            </>
          )}
        </Paper>
      )}
      
      {/* Visible eSewa payment form for direct debugging */}
      <form
        ref={formRef}
        action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
        method="POST"
        encType="application/x-www-form-urlencoded"
        style={{ margin: '20px 0', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', display: debug ? 'block' : 'none' }}
      >
        <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>Payment Form:</Typography>
        {paymentData && Object.entries(paymentData.paymentData).map(([key, value]) => (
          <div key={key} style={{ margin: '5px 0' }}>
            <label style={{ display: 'inline-block', width: '200px', textAlign: 'right', marginRight: '10px' }}>
              {key}:
            </label>
            <input 
              type="text" 
              name={key} 
              defaultValue={value} 
              style={{ width: '300px', padding: '5px' }}
            />
          </div>
        ))}
        <div style={{ marginTop: '15px' }}>
          <Button
            variant="contained"
            color="warning"
            onClick={handlePayment}
            sx={{ mr: 1 }}
          >
            Submit Direct Form
          </Button>
        </div>
      </form>
      
      {/* Hidden form for normal payment flow */}
      <form
        id="hiddenEsewaForm"
        action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
        method="POST"
        encType="application/x-www-form-urlencoded"
        style={{ display: 'none' }}
      >
        {paymentData && Object.entries(paymentData.paymentData).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      </form>
      
      <Button
        variant="contained"
        color="success"
        onClick={handlePayment}
        disabled={!paymentData || loading}
        sx={{ 
          backgroundColor: '#60BB46', 
          '&:hover': { backgroundColor: '#4d9936' },
          px: 4,
          py: 1
        }}
      >
        Pay with eSewa
      </Button>
      
      {/* Test credentials */}
      {debug && (
        <Paper sx={{ p: 2, mt: 2, bgcolor: '#f8f8f8' }}>
          <Typography variant="subtitle2" gutterBottom>Test Credentials:</Typography>
          <Typography variant="caption" display="block">eSewa ID: 9806800001</Typography>
          <Typography variant="caption" display="block">Password: Nepal@123</Typography>
          <Typography variant="caption" display="block">MPIN: 1122</Typography>
          <Typography variant="caption" display="block">Token: 123456</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default EsewaPayment; 