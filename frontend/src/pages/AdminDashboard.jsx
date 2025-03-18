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
  Badge,
  Chip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Routes, Route, useNavigate, Link, useLocation } from "react-router-dom";
import AdminProducts from "../components/AdminProducts";
import AdminOrders from "../components/AdminOrders";
import AdminUsers from "../components/AdminUsers";
import AdminDashboardHome from "../components/AdminDashboardHome";
import AdminProfileDialog from "../components/AdminProfileDialog";
import AdminBargains from '../components/AdminBargains';
import "./AdminDashboard.css"; // Import the CSS file

const AdminDashboard = () => {
  const drawerWidth = 240;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [pendingBargains, setPendingBargains] = useState(0);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || user.role !== "admin") {
      navigate("/login");
    } else {
      setUserData(user);
    }
    
    // Fetch pending bargains count
    const fetchPendingBargainsCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/bargains`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const bargains = await response.json();
          const pendingCount = bargains.filter(bargain => bargain.status === "pending").length;
          setPendingBargains(pendingCount);
        }
      } catch (error) {
        console.error("Error fetching bargains:", error);
      }
    };
    
    fetchPendingBargainsCount();
    
    // Set up interval to refresh count
    const interval = setInterval(fetchPendingBargainsCount, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileOpen = () => {
    setIsProfileOpen(true);
  };

  const handleProfileClose = () => {
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { text: "Dashboard", path: "/admin", icon: "📊" },
    { text: "Products", path: "/admin/products", icon: "🛍️" },
    { text: "Orders", path: "/admin/orders", icon: "📦" },
    { text: "Users", path: "/admin/customers", icon: "👥" },
    { text: "Bargain Requests", path: "/admin/bargains", icon: "💲" },
  ];

  const drawer = (
    <>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isBargainItem = item.path === '/admin/bargains';
          
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
                <ListItemIcon>
                  {isBargainItem && pendingBargains > 0 ? (
                    <Badge color="warning" badgeContent={pendingBargains}>
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    isBargainItem ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {item.text}
                        {pendingBargains > 0 && (
                          <Chip 
                            size="small" 
                            color="warning" 
                            label={`${pendingBargains} pending`} 
                            sx={{ ml: 1, height: 20 }} 
                          />
                        )}
                      </Box>
                    ) : (
                      item.text
                    )
                  } 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleProfileOpen}>
            <ListItemIcon>👤</ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>🚪</ListItemIcon>
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
            Admin Dashboard
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
          <Route index element={<AdminDashboardHome />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminUsers />} />
          <Route path="bargains" element={<AdminBargains />} />
          <Route path="*" element={<AdminDashboardHome />} />
        </Routes>
      </Box>
      <AdminProfileDialog
        open={isProfileOpen}
        onClose={handleProfileClose}
        user={userData}
      />
    </Box>
  );
};

export default AdminDashboard;
