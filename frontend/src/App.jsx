import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Container, Box } from "@mui/material";
import Navbar from "./components/Navbar";
import ProductDetails from "./pages/ProductDetails";
import Footer from "./components/Footer";
import Carousel from "./components/Carousel";
import ProductGrid from "./components/ProductGrid";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import "./App.css";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./components/ProductDetail";
import AdminDashboardHome from "./components/AdminDashboardHome";
import AdminProducts from "./components/AdminProducts";
import AdminOrders from "./components/AdminOrders";
import AdminUsers from "./components/AdminUsers";
import AdminBargains from "./components/AdminBargains";
import AdminProfile from "./components/AdminProfile";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import Orders from "./pages/Orders";
import OrderPayment from "./pages/OrderPayment";
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Conditionally import the test page only in development
const EsewaTestPage = import.meta.env.DEV 
  ? React.lazy(() => import('./pages/EsewaTestPage')) 
  : null;

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#ffffff",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#000000",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h6: {
      fontWeight: 600,
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "admin";

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Wrapper component to handle conditional footer rendering
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";
  const showFooter = !(isAdminRoute && isAdmin);
  const showNavbar = !(isAdminRoute && isAdmin);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        margin: 0,
        padding: 0,
      }}
    >
      {showNavbar && <Navbar />}
      <Box
        component="main"
        sx={{ flexGrow: 1, width: "100%", margin: 0, padding: 0 }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/cart"
            element={
              <PrivateRoute>
                <Cart />
              </PrivateRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            }
          />
          <Route
            path="/order-confirmation/:id"
            element={
              <PrivateRoute>
                <OrderConfirmation />
              </PrivateRoute>
            }
          />
          <Route path="/order-tracking" element={<OrderTracking />} />
          
          {/* Admin routes - use AdminDashboard as the parent container */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            }
          />
          <Route path="/payment/:orderId" element={<PrivateRoute><OrderPayment /></PrivateRoute>} />
          
          {/* Development-only routes */}
          {import.meta.env.DEV && EsewaTestPage && (
            <Route 
              path="/esewa-test" 
              element={
                <React.Suspense fallback={<div>Loading test tools...</div>}>
                  <EsewaTestPage />
                </React.Suspense>
              } 
            />
          )}
        </Routes>
      </Box>
      {showFooter && <Footer />}
    </Box>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AppContent />
          </Router>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
