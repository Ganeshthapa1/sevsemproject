import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view your orders');
        return;
      }

      const response = await axios.get(`${API_URL}/api/orders/vendor`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Error fetching orders');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
    setNewStatus('');
  };

  const handleUpdateStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to update order status');
        return;
      }

      await axios.put(
        `${API_URL}/api/orders/vendor/${selectedOrder._id}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      handleCloseDialog();
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error.response?.data?.message || 'Error updating order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Orders
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Alert severity="info">
          You don't have any orders yet.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Products</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order.orderNumber || order._id}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{order.user?.name || 'N/A'}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {order.user?.email || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {order.items.map((item) => (
                      <Box key={item._id} mb={1}>
                        <Typography variant="body2">
                          {item.product?.name || 'Unknown Product'} x {item.quantity}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ${item.price} each
                        </Typography>
                      </Box>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">${order.totalAmount}</Typography>
                    {order.proposedTotal && (
                      <Typography variant="caption" color="textSecondary">
                        Proposed: ${order.proposedTotal}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Alert severity={getStatusColor(order.status)} sx={{ py: 0 }}>
                      {order.status}
                    </Alert>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenDialog(order)}
                      disabled={order.status === 'delivered' || order.status === 'cancelled'}
                    >
                      Update Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Order #{selectedOrder?.orderNumber || selectedOrder?._id}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Current Status: {selectedOrder?.status}
            </Typography>
          </Box>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateStatus} 
            variant="contained" 
            color="primary"
            disabled={newStatus === selectedOrder?.status}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorOrders; 