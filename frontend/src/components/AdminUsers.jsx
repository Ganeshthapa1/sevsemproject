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
  Switch,
  Alert,
  CircularProgress,
  FormControlLabel,
  Select,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
} from "@mui/material";
import axios from "axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`/auth/users`);
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await axios.patch(
        `/auth/users/${userId}/toggle-status`,
        {}
      );
      // Update the local state
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, isActive: !currentStatus } : user
        )
      );
    } catch (error) {
      console.error("Error toggling user status:", error);
      setError("Failed to update user status");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/auth/users/${userId}/role`, { role: newRole });
      setSnackbar({
        open: true,
        message: 'Role updated successfully',
        severity: 'success'
      });
      fetchUsers(); // Refresh the users list
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error updating role',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Typography variant="h5" gutterBottom component="div">
        Manage Users
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="vendor">Vendor</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>{user.isActive ? "Active" : "Disabled"}</TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={user.isActive}
                        onChange={() =>
                          handleToggleStatus(user._id, user.isActive)
                        }
                        disabled={user.role === "admin"}
                      />
                    }
                    label={user.isActive ? "Active" : "Disabled"}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUsers;
