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

// Remove /api from the end if it's already there
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const BASE_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

const VendorBargains = () => {
  const [bargains, setBargains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBargain, setSelectedBargain] = useState(null);
  const [counterOffer, setCounterOffer] = useState('');

  const fetchBargains = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view bargain requests");
        return;
      }

      const response = await axios.get(`${BASE_URL}/bargains/vendor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Bargains data:", response.data);
      setBargains(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bargains:", error);
      setError(error.response?.data?.message || "Error fetching bargain requests");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBargains();
  }, []);

  const handleOpenDialog = (bargain) => {
    setSelectedBargain(bargain);
    setCounterOffer(bargain.counterOffer || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBargain(null);
    setCounterOffer('');
  };

  const handleAcceptBargain = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to accept bargain requests");
        return;
      }

      await axios.put(
        `${BASE_URL}/bargains/${selectedBargain._id}/status`,
        { status: "accepted" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      handleCloseDialog();
      fetchBargains();
    } catch (error) {
      console.error("Error accepting bargain:", error);
      setError(error.response?.data?.message || "Error accepting bargain request");
    }
  };

  const handleRejectBargain = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to reject bargain requests");
        return;
      }

      await axios.put(
        `${BASE_URL}/bargains/${selectedBargain._id}/status`,
        { status: "rejected" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      handleCloseDialog();
      fetchBargains();
    } catch (error) {
      console.error("Error rejecting bargain:", error);
      setError(error.response?.data?.message || "Error rejecting bargain request");
    }
  };

  const handleCounterOffer = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to make counter offers");
        return;
      }

      await axios.put(
        `${BASE_URL}/bargains/${selectedBargain._id}/status`,
        { 
          status: "countered",
          counterOffer: parseFloat(counterOffer)
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      handleCloseDialog();
      fetchBargains();
    } catch (error) {
      console.error("Error making counter offer:", error);
      setError(error.response?.data?.message || "Error making counter offer");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "accepted":
        return "success";
      case "rejected":
        return "error";
      case "countered":
        return "info";
      default:
        return "default";
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
        Manage Bargain Requests
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {bargains.length === 0 ? (
        <Alert severity="info">
          You don't have any bargain requests yet.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Original Price</TableCell>
                <TableCell>Offered Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bargains.map((bargain) => (
                <TableRow key={bargain._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {bargain.product?.name || 'Unknown Product'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Stock: {bargain.product?.stock || 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {bargain.user?.name || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {bargain.user?.email || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">${bargain.originalPrice}</Typography>
                    {bargain.product?.price !== bargain.originalPrice && (
                      <Typography variant="caption" color="textSecondary">
                        Current: ${bargain.product?.price}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">${bargain.proposedPrice}</Typography>
                    {bargain.counterOffer && (
                      <Typography variant="caption" color="textSecondary">
                        Counter: ${bargain.counterOffer}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={bargain.status}
                      color={getStatusColor(bargain.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {new Date(bargain.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(bargain.createdAt).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {bargain.status === "pending" && (
                      <Button
                        variant="outlined"
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Respond to Bargain Request</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Product: {selectedBargain?.product?.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Stock Available: {selectedBargain?.product?.stock}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Original Price: ${selectedBargain?.originalPrice}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Offered Price: ${selectedBargain?.proposedPrice}
            </Typography>
            {selectedBargain?.counterOffer && (
              <Typography variant="subtitle1" gutterBottom>
                Previous Counter Offer: ${selectedBargain.counterOffer}
              </Typography>
            )}
            <TextField
              fullWidth
              label="Counter Offer (Optional)"
              type="number"
              value={counterOffer}
              onChange={(e) => setCounterOffer(e.target.value)}
              margin="normal"
              helperText="Enter a price between the original and offered price"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleRejectBargain} color="error">
            Reject
          </Button>
          <Button onClick={handleAcceptBargain} color="success">
            Accept
          </Button>
          {counterOffer && (
            <Button 
              onClick={handleCounterOffer} 
              color="primary"
              disabled={counterOffer <= selectedBargain?.proposedPrice || counterOffer >= selectedBargain?.originalPrice}
            >
              Counter Offer
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorBargains; 
export default VendorBargains; 