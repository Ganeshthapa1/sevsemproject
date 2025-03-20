import React from "react";
import { Box, Container, Grid } from "@mui/material";
import VendorDashboardHome from "../components/VendorDashboardHome";
import VendorProducts from "../components/VendorProducts";
import VendorOrders from "../components/VendorOrders";
import VendorProfile from "../components/VendorProfile";
import { Routes, Route } from "react-router-dom";

const VendorDashboard = () => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Routes>
              <Route path="/" element={<VendorDashboardHome />} />
              <Route path="/products" element={<VendorProducts />} />
              <Route path="/orders" element={<VendorOrders />} />
              <Route path="/profile" element={<VendorProfile />} />
            </Routes>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default VendorDashboard; 