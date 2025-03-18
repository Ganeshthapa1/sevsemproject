import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "black",
        color: "white",
        pt: 6,
        pb: 3,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              About Nepali Mart
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Your premier destination for authentic Nepali products. We bring
              the finest handicrafts, traditional art, and cultural items
              directly from Nepal to your doorstep.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton color="secondary" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton color="secondary" aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
              <IconButton color="secondary" aria-label="Twitter">
                <TwitterIcon />
              </IconButton>
              <IconButton color="secondary" aria-label="LinkedIn">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Quick Links
            </Typography>
            <List dense>
              <ListItem disablePadding>
                <ListItemText>
                  <Link href="/new-arrivals" color="secondary">
                    New Arrivals
                  </Link>
                </ListItemText>
              </ListItem>
              <ListItem disablePadding>
                <ListItemText>
                  <Link href="/best-sellers" color="secondary">
                    Best Sellers
                  </Link>
                </ListItemText>
              </ListItem>
              <ListItem disablePadding>
                <ListItemText>
                  <Link href="/special-offers" color="secondary">
                    Special Offers
                  </Link>
                </ListItemText>
              </ListItem>
              <ListItem disablePadding>
                <ListItemText>
                  <Link href="/gift-cards" color="secondary">
                    Gift Cards
                  </Link>
                </ListItemText>
              </ListItem>
            </List>
          </Grid>

          {/* Customer Service */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Customer Service
            </Typography>
            <List dense>
              <ListItem disablePadding>
                <ListItemText>
                  <Link href="/shipping" color="secondary">
                    Shipping Information
                  </Link>
                </ListItemText>
              </ListItem>
              <ListItem disablePadding>
                <ListItemText>
                  <Link href="/returns" color="secondary">
                    Returns & Exchanges
                  </Link>
                </ListItemText>
              </ListItem>
              <ListItem disablePadding>
                <ListItemText>
                  <Link href="/faq" color="secondary">
                    FAQ
                  </Link>
                </ListItemText>
              </ListItem>
              <ListItem disablePadding>
                <ListItemText>
                  <Link href="/privacy" color="secondary">
                    Privacy Policy
                  </Link>
                </ListItemText>
              </ListItem>
            </List>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Contact Us
            </Typography>
            <List dense>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <LocationOnIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  123 Thamel, Kathmandu, Nepal
                </Typography>
              </ListItem>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <PhoneIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">+977-1-4XXXXXX</Typography>
              </ListItem>
              <ListItem disablePadding>
                <EmailIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">info@nepalimart.com</Typography>
              </ListItem>
            </List>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: "rgba(255, 255, 255, 0.1)" }} />

        {/* Copyright */}
        <Box sx={{ textAlign: "center", pt: 2 }}>
          <Typography variant="body2" color="secondary">
            © {new Date().getFullYear()} Nepali Mart. All rights reserved.
          </Typography>
          <Typography
            variant="caption"
            color="secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Designed by Nirajan Oli
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
