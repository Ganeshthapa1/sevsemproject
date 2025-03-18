import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip
} from "@mui/material";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const AdminBargains = () => {
  const [bargains, setBargains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBargain, setSelectedBargain] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBargains = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/bargains/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Bargains data:", response.data);
      setBargains(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bargains:", err);
      setError("Failed to fetch bargain requests");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBargains();
  }, []);

  const handleOpenDialog = (bargain) => {
    setSelectedBargain(bargain);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBargain(null);
    setResponse("");
  };

  const handleUpdateStatus = async (status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/bargains/${selectedBargain._id}/status`,
        {
          status,
          adminResponse: response,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess(`Bargain request ${status}`);
      setTimeout(() => {
        setSuccess("");
      }, 3000);
      handleCloseDialog();
      fetchBargains();
    } catch (err) {
      console.error("Error updating bargain:", err);
      setError(`Failed to ${status} bargain request`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Bargain Requests
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {bargains.length === 0 ? (
        <Alert severity="info">No bargain requests found</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Product/Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Original Price</TableCell>
                <TableCell>Proposed Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bargains.map((bargain) => (
                <TableRow key={bargain._id}>
                  <TableCell>{new Date(bargain.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {bargain.product ? 
                      bargain.product.name : 
                      bargain.items && bargain.items.length > 0 ? 
                        `Order with ${bargain.items.length} items` : 
                        'Full Order'
                    }
                  </TableCell>
                  <TableCell>{bargain.user?.name || 'Unknown'}</TableCell>
                  <TableCell>${bargain.originalPrice.toFixed(2)}</TableCell>
                  <TableCell>${bargain.proposedPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={bargain.status.charAt(0).toUpperCase() + bargain.status.slice(1)}
                      color={
                        bargain.status === 'pending' ? 'warning' : 
                        bargain.status === 'accepted' ? 'success' : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {bargain.status === 'pending' && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenDialog(bargain)}
                      >
                        Respond
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Respond to Bargain Request</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              Customer: {selectedBargain?.user?.name}
            </Typography>
            {selectedBargain?.product ? (
              <Typography variant="subtitle1">
                Product: {selectedBargain?.product?.name}
              </Typography>
            ) : (
              <Typography variant="subtitle1">
                Order with multiple items
              </Typography>
            )}
            <Typography variant="subtitle1">
              Original Price: ${selectedBargain?.originalPrice?.toFixed(2)}
            </Typography>
            <Typography variant="subtitle1">
              Proposed Price: ${selectedBargain?.proposedPrice?.toFixed(2)}
            </Typography>
            <Typography variant="subtitle1">
              Discount: {selectedBargain ? 
                ((1 - selectedBargain.proposedPrice / selectedBargain.originalPrice) * 100).toFixed(2) 
                : 0}%
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Response"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Enter your response to the customer's offer"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleUpdateStatus('rejected')}
            disabled={!response}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleUpdateStatus('accepted')}
            disabled={!response}
          >
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminBargains; 