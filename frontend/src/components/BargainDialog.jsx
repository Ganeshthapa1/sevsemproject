import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import axios from "axios";

const BargainDialog = ({ open, onClose, product }) => {
  const [proposedPrice, setProposedPrice] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to make an offer");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bargains`,
        {
          productId: product._id,
          proposedPrice: parseFloat(proposedPrice)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess("Your offer has been submitted successfully!");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit offer");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Make an Offer</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {product.name}
          </Typography>
          <Typography color="text.secondary">
            Original Price: ${product.price}
          </Typography>
        </Box>

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

        <TextField
          label="Your Proposed Price"
          type="number"
          fullWidth
          value={proposedPrice}
          onChange={(e) => setProposedPrice(e.target.value)}
          InputProps={{
            startAdornment: "$"
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!proposedPrice || parseFloat(proposedPrice) >= product.price}
        >
          Submit Offer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BargainDialog; 