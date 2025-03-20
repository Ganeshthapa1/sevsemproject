import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  Alert,
  CircularProgress,
  Paper,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { Routes, Route, useNavigate, Link, useLocation } from "react-router-dom";
import VendorDashboardHome from "../components/VendorDashboardHome";
import VendorProducts from "../components/VendorProducts";
import VendorOrders from "../components/VendorOrders";
import VendorProfile from "../components/VendorProfile";
import "../pages/AdminDashboard.css"; // Reuse the AdminDashboard CSS
import { useAuth } from "../context/AuthContext";
import axios from "axios";

// Define API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Bargain requests management component
const VendorBargains = () => {
  const [bargains, setBargains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBargains = async () => {
      try {
        console.log('Fetching bargain requests for vendor:', user._id);
        const response = await axios.get(`${API_URL}/api/orders/vendor`);
        console.log('Bargain response:', response.data);
        
        // Filter orders with bargain requests
        const bargainOrders = response.data.filter(order => 
          order.status === 'awaiting_bargain_approval' || 
          order.orderItems.some(item => item.bargainRequest && item.bargainRequest.status === 'pending')
        );
        
        console.log('Filtered bargain orders:', bargainOrders);
        setBargains(bargainOrders);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bargains:', err);
        setError(err.response?.data?.message || 'Failed to fetch bargain requests');
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchBargains();
    } else {
      setError('User not authenticated');
      setLoading(false);
    }
  }, [user?._id]);

  const handleBargainResponse = async (orderId, itemId, status, response) => {
    try {
      console.log('Responding to bargain:', { orderId, itemId, status, response });
      await axios.put(`${API_URL}/api/orders/vendor/${orderId}`, {
        itemId,
        status,
        vendorResponse: response
      });
      
      // Refresh bargains after response
      const fetchResponse = await axios.get(`${API_URL}/api/orders/vendor`);
      const bargainOrders = fetchResponse.data.filter(order => 
        order.status === 'awaiting_bargain_approval' || 
        order.orderItems.some(item => item.bargainRequest && item.bargainRequest.status === 'pending')
      );
      setBargains(bargainOrders);
    } catch (err) {
      console.error('Error updating bargain:', err);
      setError(err.response?.data?.message || 'Failed to update bargain request');
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Bargain Requests</Typography>
      {bargains.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Alert severity="info">No pending bargain requests.</Alert>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Original Price</TableCell>
                <TableCell>Proposed Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bargains.map((order) => (
                order.orderItems
                  .filter(item => item.bargainRequest && item.bargainRequest.status === 'pending')
                  .map((item) => (
                    <TableRow key={`${order._id}-${item.product._id}`}>
                      <TableCell>{order.orderNumber || order._id}</TableCell>
                      <TableCell>{order.user?.name || 'N/A'}</TableCell>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>Rs. {item.price}</TableCell>
                      <TableCell>Rs. {item.bargainRequest.proposedPrice}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status?.replace(/_/g, ' ').toUpperCase() || 'PENDING'}
                          color={order.status === 'awaiting_bargain_approval' ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleBargainResponse(order._id, item.product._id, 'processing', 'Bargain accepted')}
                          sx={{ mr: 1 }}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleBargainResponse(order._id, item.product._id, 'cancelled', 'Bargain rejected')}
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

const VendorDashboard = () => {
  const drawerWidth = 240;
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Check if user is vendor
    if (!user || user.role !== "vendor") {
      navigate("/login");
    }
  }, [navigate, user]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { text: "Dashboard", path: "/vendor/dashboard", icon: <DashboardIcon /> },
    { text: "Products", path: "/vendor/dashboard/products", icon: <InventoryIcon /> },
    { text: "Orders", path: "/vendor/dashboard/orders", icon: <ShoppingCartIcon /> },
    { text: "Bargains", path: "/vendor/dashboard/bargains", icon: <LocalOfferIcon /> },
    { text: "Profile", path: "/vendor/dashboard/profile", icon: <PersonIcon /> },
  ];

  const drawer = (
    <>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Vendor Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  bgcolor: isActive ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(0, 0, 0, 0.12)' : undefined,
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Vendor Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={<VendorDashboardHome />} />
          <Route path="/products/*" element={<VendorProducts />} />
          <Route path="/orders" element={<VendorOrders />} />
          <Route path="/bargains" element={<VendorBargains />} />
          <Route path="/profile" element={<VendorProfile />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default VendorDashboard; 