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
  IconButton,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Grid,
  Divider,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import BlockIcon from "@mui/icons-material/Block";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const statusIcons = {
  pending: <PendingIcon />,
  packaging: <InventoryIcon />,
  shipping: <LocalShippingIcon />,
  delivered: <CheckCircleIcon />,
  cancelled: <BlockIcon />,
  awaiting_bargain_approval: <PriceChangeIcon />,
};

const statusLabels = {
  pending: "Pending",
  packaging: "Packaging",
  shipping: "Shipping",
  delivered: "Delivered",
  cancelled: "Cancelled",
  awaiting_bargain_approval: "Awaiting Bargain Approval",
};

const Row = ({ order, onStatusChange }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/orders/${order._id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onStatusChange();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if this order has an approved bargain
  const hasBargain = order.bargainRequest && order.bargainRequest.status;
  const isBargainAccepted = hasBargain && order.bargainRequest.status === 'accepted';
  const isBargainRejected = hasBargain && order.bargainRequest.status === 'rejected';
  const showBargainInfo = hasBargain && (isBargainAccepted || isBargainRejected);

  const orderStatusDisplay = order.status === 'awaiting_bargain_approval' 
    ? statusLabels.awaiting_bargain_approval
    : statusLabels[order.status] || order.status.replace(/_/g, ' ').toUpperCase();

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>#{order.orderNumber || order._id.slice(-8)}</TableCell>
        <TableCell>
          {order.deletedUser ? (
            <Typography color="error" variant="body2">
              [Deleted User]
            </Typography>
          ) : (
            order.user?.name || "Unknown User"
          )}
        </TableCell>
        <TableCell>{formatDate(order.createdAt)}</TableCell>
        <TableCell>
          {isBargainAccepted ? (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                Rs. {order.totalAmount.toLocaleString()}
              </Typography>
              <Typography variant="body1" color="success.main">
                Rs. {order.proposedTotal.toLocaleString()} (Approved)
              </Typography>
            </Box>
          ) : (
            `Rs. ${order.totalAmount.toLocaleString()}`
          )}
        </TableCell>
        <TableCell>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={order.status}
              onChange={handleStatusChange}
              disabled={loading || order.deletedUser}
              size="small"
              sx={{
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                },
              }}
            >
              {Object.keys(statusIcons).map((status) => (
                <MenuItem
                  key={status}
                  value={status}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  {statusIcons[status]}
                  {statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Grid container spacing={2}>
                {/* Order Details Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom component="div">
                    Order Details
                  </Typography>
                  
                  {/* Bargain Information if applicable */}
                  {showBargainInfo && (
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        mb: 3, 
                        bgcolor: isBargainAccepted ? 'success.light' : 'error.light',
                        color: 'white'
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6">
                          Bargain {isBargainAccepted ? 'Accepted' : 'Rejected'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1">Original Price: Rs. {order.totalAmount.toLocaleString()}</Typography>
                          <Typography variant="body1">Customer's Offer: Rs. {order.proposedTotal?.toLocaleString()}</Typography>
                        </Box>
                        {order.bargainRequest?.adminResponse && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Admin Response: {order.bargainRequest.adminResponse}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </Grid>
                
                {/* Order Items List */}
                <Grid item xs={12}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell component="th" scope="row">
                            <Box
                              sx={{ display: "flex", alignItems: "center", gap: 2 }}
                            >
                              {item.product ? (
                                <>
                                  {item.product.images && item.product.images.length > 0 ? (
                                    <Box
                                      component="img"
                                      src={`${API_URL}${item.product.images[0]}`}
                                      alt={item.product.name}
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        objectFit: "cover",
                                        borderRadius: 1,
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        bgcolor: 'grey.300',
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      No img
                                    </Box>
                                  )}
                                  {item.product.name}
                                </>
                              ) : (
                                <Typography color="error" variant="body2">
                                  [Product Not Found]
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell align="right">
                            Rs. {item.price?.toLocaleString() || 'N/A'}
                          </TableCell>
                          <TableCell align="right">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <strong>Subtotal:</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Rs. {order.totalAmount.toLocaleString()}</strong>
                        </TableCell>
                      </TableRow>
                      {isBargainAccepted && (
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <strong>Final Price (After Bargain):</strong>
                          </TableCell>
                          <TableCell align="right" sx={{ color: 'success.main' }}>
                            <strong>Rs. {order.proposedTotal.toLocaleString()}</strong>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Grid>

                {/* Customer Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                    Customer Information
                  </Typography>
                  <Box sx={{ ml: 2 }}>
                    <Typography>
                      <strong>Name:</strong> {order.contactInfo?.fullName || order.user?.name || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Email:</strong> {order.contactInfo?.email || order.user?.email || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Phone:</strong> {order.contactInfo?.phone || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Shipping Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                    Shipping Information
                  </Typography>
                  <Box sx={{ ml: 2 }}>
                    <Typography>
                      <strong>Address:</strong> {order.shippingAddress?.street || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>City:</strong> {order.shippingAddress?.city || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>State/Province:</strong> {order.shippingAddress?.state || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Postal Code:</strong> {order.shippingAddress?.zipCode || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Country:</strong> {order.shippingAddress?.country || 'Nepal'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Payment Details */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                    Payment Details
                  </Typography>
                  <Box sx={{ ml: 2 }}>
                    <Typography>
                      <strong>Method:</strong> {order.paymentMethod?.toUpperCase() || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Status:</strong> {' '}
                      <Chip 
                        size="small" 
                        color={order.paymentStatus === 'completed' ? 'success' : 'warning'}
                        label={order.paymentStatus?.toUpperCase() || 'PENDING'} 
                      />
                    </Typography>
                  </Box>
                </Grid>
                
                {/* Notes */}
                {order.notes && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                      Order Notes
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="body2">{order.notes}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/orders/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Orders data:", response.data); // Debugging: Log the response data
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getFilteredOrders = () => {
    if (filterStatus === "all") return orders;
    
    if (filterStatus === "bargained") {
      return orders.filter(order => 
        order.bargainRequest && 
        order.bargainRequest.status === "accepted"
      );
    }
    
    return orders.filter(order => order.status === filterStatus);
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

  const filteredOrders = getFilteredOrders();

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Typography variant="h5" gutterBottom component="div">
        Manage Orders
      </Typography>
      
      {/* Filter by status */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Typography variant="body1" sx={{ mr: 2 }}>Filter by status:</Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            size="small"
          >
            <MenuItem value="all">All Orders</MenuItem>
            <MenuItem value="bargained">Bargained Orders</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="packaging">Packaging</MenuItem>
            <MenuItem value="shipping">Shipping</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="awaiting_bargain_approval">Awaiting Bargain Approval</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredOrders.length === 0 ? (
        <Alert severity="info">No orders found matching the selected filter.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <Row key={order._id} order={order} onStatusChange={fetchOrders} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminOrders;
