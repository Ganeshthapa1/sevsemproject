import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Container,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
} from '@mui/material';
import { useNavigate, Routes, Route } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// Dashboard home component (statistics overview)
const VendorDashboardHome = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Vendor Dashboard</Typography>
      
      <Alert severity="info" sx={{ mb: 4 }}>
        Welcome to your vendor dashboard. Here you can manage your products and view order statistics.
      </Alert>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h3">0</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Orders
              </Typography>
              <Typography variant="h3">0</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h3">$0</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Products management component
const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`/products/vendor/${user._id}`);
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user._id]);

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/products/${productId}`);
        setProducts(products.filter(product => product._id !== productId));
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  if (loading) return <Typography>Loading products...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Manage Products</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/vendor/dashboard/products/add')}
        >
          Add Product
        </Button>
      </Box>

      {products.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Alert severity="info">
            You don't have any products yet. Add your first product to start selling.
          </Alert>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <Box
                      component="img"
                      src={product.images[0] || '/placeholder.png'}
                      alt={product.name}
                      sx={{ width: 50, height: 50, objectFit: 'cover' }}
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>Rs. {product.price}</TableCell>
                  <TableCell>{product.countInStock}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={product.countInStock > 0 ? 'success.main' : 'error.main'}
                    >
                      {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/vendor/dashboard/products/edit/${product._id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

// Orders management component
const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`/orders/vendor/${user._id}`);
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user._id]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/orders/${orderId}/status`, { status: newStatus });
      // Refresh orders after status update
      const response = await axios.get(`/orders/vendor/${user._id}`);
      setOrders(response.data);
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  if (loading) return <Typography>Loading orders...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Manage Orders</Typography>
      {orders.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Alert severity="info">No orders found.</Alert>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order.orderNumber || order._id}</TableCell>
                  <TableCell>{order.user?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>Rs. {order.total}</TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="processing">Processing</MenuItem>
                        <MenuItem value="shipped">Shipped</MenuItem>
                        <MenuItem value="delivered">Delivered</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color={
                      order.paymentStatus === 'paid' ? 'success.main' : 'error.main'
                    }>
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

// Profile component
const VendorProfile = () => {
  const { user } = useAuth();
  
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Vendor Profile</Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">Name:</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography>{user?.name || 'N/A'}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">Email:</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography>{user?.email || 'N/A'}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">Role:</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography>{user?.role || 'N/A'}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

// Main Vendor Dashboard component
const VendorDashboard = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleListItemClick = (index, path) => {
    setSelectedIndex(index);
    if (path) {
      navigate(path);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: 240,
          flexShrink: 0,
          bgcolor: '#f5f5f5',
          borderRight: '1px solid #e0e0e0',
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" fontWeight="bold">
            Vendor Panel
          </Typography>
        </Box>
        <List>
          <ListItem
            button
            selected={selectedIndex === 0}
            onClick={() => handleListItemClick(0, '/vendor/dashboard')}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          
          <ListItem
            button
            selected={selectedIndex === 1}
            onClick={() => handleListItemClick(1, '/vendor/dashboard/products')}
          >
            <ListItemIcon>
              <InventoryIcon />
            </ListItemIcon>
            <ListItemText primary="Products" />
          </ListItem>
          
          <ListItem
            button
            selected={selectedIndex === 2}
            onClick={() => handleListItemClick(2, '/vendor/dashboard/orders')}
          >
            <ListItemIcon>
              <ShoppingCartIcon />
            </ListItemIcon>
            <ListItemText primary="Orders" />
          </ListItem>
          
          <Divider sx={{ my: 1 }} />
          
          <ListItem
            button
            selected={selectedIndex === 3}
            onClick={() => handleListItemClick(3, '/vendor/dashboard/profile')}
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          
          <ListItem
            button
            onClick={handleLogout}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: '#fafafa',
        }}
      >
        <Container maxWidth="lg">
          <Routes>
            <Route path="/" element={<VendorDashboardHome />} />
            <Route path="/products" element={<VendorProducts />} />
            <Route path="/orders" element={<VendorOrders />} />
            <Route path="/profile" element={<VendorProfile />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
};

export default VendorDashboard; 