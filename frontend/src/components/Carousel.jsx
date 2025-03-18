import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  MobileStepper,
  Button,
  Typography,
  Container,
  IconButton,
} from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";

const carouselItems = [
  {
    image:
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&w=1500&q=80",
    title: "Authentic Nepali Crafts",
    description: "Discover handcrafted treasures from Nepal",
  },
  {
    image:
      "https://images.unsplash.com/photo-1593260654784-4aa2e5c11ecf?auto=format&w=1500&q=80",
    title: "Traditional Art",
    description: "Explore the rich cultural heritage",
  },
  {
    image:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&w=1500&q=80",
    title: "Spiritual Collection",
    description: "Find peace with our spiritual items",
  },
];

const Carousel = () => {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = carouselItems.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prevStep) => (prevStep + 1) % maxSteps);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [maxSteps]);

  const handleNext = () => {
    setActiveStep((prevStep) => (prevStep + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => (prevStep - 1 + maxSteps) % maxSteps);
  };

  return (
    <Box sx={{ position: "relative", width: "100%", mb: 4 }}>
      <Paper
        square
        elevation={0}
        sx={{
          position: "relative",
          height: "500px",
          overflow: "hidden",
        }}
      >
        {carouselItems.map((item, index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              opacity: index === activeStep ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
            }}
          >
            <img
              src={item.image}
              alt={item.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                textAlign: "center",
                padding: 2,
              }}
            >
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                {item.title}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                {item.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Paper>

      <IconButton
        onClick={handleBack}
        sx={{
          position: "absolute",
          left: 8,
          top: "50%",
          transform: "translateY(-50%)",
          bgcolor: "rgba(255,255,255,0.3)",
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.5)",
          },
        }}
      >
        <KeyboardArrowLeft />
      </IconButton>

      <IconButton
        onClick={handleNext}
        sx={{
          position: "absolute",
          right: 8,
          top: "50%",
          transform: "translateY(-50%)",
          bgcolor: "rgba(255,255,255,0.3)",
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.5)",
          },
        }}
      >
        <KeyboardArrowRight />
      </IconButton>

      <MobileStepper
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        sx={{
          bgcolor: "transparent",
          position: "absolute",
          bottom: 0,
          width: "100%",
        }}
        nextButton={<Box />}
        backButton={<Box />}
      />
    </Box>
  );
};

export default Carousel;
