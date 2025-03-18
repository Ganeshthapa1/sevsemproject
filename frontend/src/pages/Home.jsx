import React from "react";
import Carousel from "../components/Carousel";
import ProductGrid from "../components/ProductGrid";
import { Box } from "@mui/material";

const Home = () => {
  return (
    <Box>
      <Carousel />
      <ProductGrid />
    </Box>
  );
};

export default Home;
