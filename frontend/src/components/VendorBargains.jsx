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
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const BASE_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

const VendorBargains = () => {
  const [bargains, setBargains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBargain, setSelectedBargain] = useState(null);
  const [response, setResponse] = useState("");

  useEffect(() => {
    fetchBargains();
  }, []);

  const fetchBargains = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BASE_URL}/bargains/vendor`, {
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

  const handleOpenDialog = (bargain) => {
    setSelectedBargain(bargain);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBargain(null);
    setResponse("");
  };

  const handleUpdateStatus = async (status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${BASE_URL}/bargains/${selectedBargain._id}/status`,
        {
          status,
          vendorResponse: response,
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bargain Requests
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Original Price</TableCell>
              <TableCell>Bargain Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bargains.map((bargain) => (
              <TableRow key={bargain._id}>
                <TableCell>{bargain.product.name}</TableCell>
                <TableCell>{bargain.user.name}</TableCell>
                <TableCell>${bargain.product.price}</TableCell>
                <TableCell>${bargain.bargainPrice}</TableCell>
                <TableCell>
                  <Chip
                    label={bargain.status}
                    color={
                      bargain.status === "pending"
                        ? "warning"
                        : bargain.status === "accepted"
                        ? "success"
                        : "error"
                    }
                  />
                </TableCell>
                <TableCell>
                  {bargain.status === "pending" && (
                    <Button
                      variant="contained"
                      color="primary"
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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Respond to Bargain Request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Response"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={() => handleUpdateStatus("rejected")}
            color="error"
            variant="contained"
          >
            Reject
          </Button>
          <Button
            onClick={() => handleUpdateStatus("accepted")}
            color="success"
            variant="contained"
          >
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorBargains; 