import React, { useState, useEffect } from "react";
import {
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  Avatar,
  Box,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const AdminProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNo: "",
    dateOfBirth: "",
    gender: "",
    bio: "",
    profilePhoto: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setFormData({
          name: response.data.name || "",
          email: response.data.email || "",
          contactNo: response.data.contactNo || "",
          dateOfBirth: response.data.dateOfBirth
            ? response.data.dateOfBirth.split("T")[0]
            : "",
          gender: response.data.gender || "",
          bio: response.data.bio || "",
          profilePhoto: response.data.profilePhoto || "",
          address: {
            street: response.data.address?.street || "",
            city: response.data.address?.city || "",
            state: response.data.address?.state || "",
            zipCode: response.data.address?.zipCode || "",
            country: response.data.address?.country || "",
          },
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch profile data");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        contactNo: user.contactNo || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: user.gender || "",
        bio: user.bio || "",
        profilePhoto: user.profilePhoto || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zipCode: user.address?.zipCode || "",
          country: user.address?.country || "",
        },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested address fields
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      // Handle other fields normally
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
        setError("Please upload a valid image file (JPEG, PNG, or GIF)");
        return;
      }
      setSelectedImage(file);
      setError("");
      console.log("File validated and set for upload");
    }
  };

  const uploadProfilePicture = async (file, token) => {
    console.log("Starting profile picture upload...");
    console.log("File to upload:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const formData = new FormData();
    formData.append("image", file);

    try {
      console.log("Sending request to upload profile picture...");
      const response = await axios.post(
        `${API_URL}/api/upload/profile-picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Profile picture upload response:", response.data);

      // Update the user state with the new data
      if (response.data.user) {
        console.log("Updating user state with:", response.data.user);
        setUser(response.data.user);
        // Update local storage
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...currentUser, ...response.data.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("Updated user in localStorage:", updatedUser);
      }

      return response.data.imagePath;
    } catch (error) {
      console.error("Profile picture upload error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error headers:", error.response?.headers);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to upload profile picture"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      let profilePhotoUrl = formData.profilePhoto;

      // Upload new profile photo if selected
      if (selectedImage) {
        try {
          profilePhotoUrl = await uploadProfilePicture(selectedImage, token);
        } catch (uploadError) {
          setError(uploadError.message);
          setLoading(false);
          return;
        }
      }

      // Prepare update data
      const updateData = {
        name: formData.name,
        contactNo: formData.contactNo || "",
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString()
          : null,
        gender: formData.gender || "",
        bio: formData.bio || "",
        profilePhoto: profilePhotoUrl,
        address: formData.address,
      };

      console.log("Sending profile update:", updateData);

      // Update user profile
      const response = await axios.put(
        `${API_URL}/api/auth/profile`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setUser(response.data);
        setSuccess("Profile updated successfully");
        // Update local storage with new user data
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...currentUser,
          ...response.data,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        setError("No data received from server");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update profile. Please try again.";
      console.error("Error details:", err.response?.data);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Profile Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Profile Photo */}
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Avatar
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : formData.profilePhoto
                    ? `${API_URL}${formData.profilePhoto}`
                    : "/default-profile.png"
                }
                alt={formData.name || "Profile"}
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  border: "2px solid #1976d2",
                }}
              />
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                id="profile-photo-input"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              <label htmlFor="profile-photo-input">
                <IconButton
                  color="primary"
                  component="span"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "white",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                    border: "1px solid #1976d2",
                  }}
                >
                  <PhotoCamera />
                </IconButton>
              </label>
            </Box>
          </Grid>

          {/* Basic Information */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              type="email"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contact Number"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                labelId="gender-label"
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
                label="Gender"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>

          {/* Address Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Address
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              name="address.street"
              value={formData.address?.street || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              name="address.city"
              value={formData.address?.city || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="State"
              name="address.state"
              value={formData.address?.state || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ZIP Code"
              name="address.zipCode"
              value={formData.address?.zipCode || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Country"
              name="address.country"
              value={formData.address?.country || ""}
              onChange={handleChange}
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default AdminProfile;
