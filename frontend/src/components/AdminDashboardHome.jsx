import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Button,
  CardActions,
} from "@mui/material";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import InventoryIcon from "@mui/icons-material/Inventory";
import BargainIcon from "@mui/icons-material/LocalOffer";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const AdminDashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingDeliveries: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [ordersByPaymentMethod, setOrdersByPaymentMethod] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [
        statsResponse,
        ordersResponse,
        orderStatusResponse,
        revenueResponse,
        paymentMethodResponse,
      ] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`, { headers }),
        axios.get(`${API_URL}/api/admin/recent-orders`, { headers }),
        axios.get(`${API_URL}/api/admin/orders-by-status`, { headers }),
        axios.get(`${API_URL}/api/admin/revenue-by-month`, { headers }),
        axios.get(`${API_URL}/api/admin/orders-by-payment`, { headers }),
      ]);

      setStats(statsResponse.data);
      setRecentOrders(ordersResponse.data);
      setOrdersByStatus(orderStatusResponse.data);
      setRevenueByMonth(revenueResponse.data);
      setOrdersByPaymentMethod(paymentMethodResponse.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  const menuItems = [
    {
      title: "Products",
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      description: "Manage your product inventory",
      path: "/admin/products",
    },
    {
      title: "Orders",
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
      description: "View and manage customer orders",
      path: "/admin/orders",
    },
    {
      title: "Customers",
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      description: "View customer information",
      path: "/admin/customers",
    },
    {
      title: "Bargains",
      icon: <BargainIcon sx={{ fontSize: 40 }} />,
      description: "Manage price bargaining requests",
      path: "/admin/bargains",
    },
  ];

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                "&:hover": {
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate(item.path)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                <Box sx={{ color: "primary.main", mb: 2 }}>{item.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button size="small" color="primary">
                  View
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminDashboardHome;
