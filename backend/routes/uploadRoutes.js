const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Ensure upload directories exist
const uploadDir = path.join(__dirname, "../uploads");
const profilePicturesDir = path.join(uploadDir, "profile-pictures");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(profilePicturesDir)) {
  fs.mkdirSync(profilePicturesDir);
}

// Configure multer for general uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    );
  },
});

// Configure multer specifically for profile pictures
const profilePictureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Destination directory:", profilePicturesDir);
    // Ensure directory exists
    if (!fs.existsSync(profilePicturesDir)) {
      console.log("Creating profile pictures directory");
      fs.mkdirSync(profilePicturesDir, { recursive: true });
    }
    cb(null, profilePicturesDir);
  },
  filename: function (req, file, cb) {
    const userId = req.user.userId;
    const ext = path.extname(file.originalname);
    const filename = `profile-${userId}${ext}`;
    console.log("Generated filename:", filename);
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

const profilePictureUpload = multer({
  storage: profilePictureStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

// General file upload endpoint
router.post("/", protect, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({ imagePath: `/uploads/${req.file.filename}` });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Profile picture upload endpoint
router.post(
  "/profile-picture",
  protect,
  profilePictureUpload.single("image"),
  async (req, res) => {
    try {
      console.log("Received profile picture upload request");
      console.log("Request body:", req.body);
      console.log("Request file:", req.file);
      console.log(
        "Upload directory exists:",
        fs.existsSync(profilePicturesDir)
      );
      console.log(
        "Upload directory contents:",
        fs.readdirSync(profilePicturesDir)
      );

      if (!req.file) {
        console.error("No file received in request");
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get absolute path of the uploaded file
      const uploadedFilePath = path.join(profilePicturesDir, req.file.filename);
      console.log("Uploaded file path:", uploadedFilePath);
      console.log("File exists:", fs.existsSync(uploadedFilePath));

      // Delete old profile picture if it exists (except default)
      const User = require("../models/userModel");
      const user = await User.findById(req.user.userId);

      if (!user) {
        console.error("User not found:", req.user.userId);
        return res.status(404).json({ message: "User not found" });
      }

      // Construct the new image path
      const imagePath = `/uploads/profile-pictures/${req.file.filename}`;
      console.log("New profile picture path:", imagePath);

      // Delete old profile picture if it exists
      if (
        user.profilePhoto &&
        !user.profilePhoto.includes("default-profile.png")
      ) {
        const oldPath = path.join(__dirname, "..", user.profilePhoto);
        console.log("Old profile picture path:", oldPath);
        console.log("Old file exists:", fs.existsSync(oldPath));

        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
            console.log("Successfully deleted old profile picture");
          } catch (deleteError) {
            console.error("Error deleting old profile picture:", deleteError);
          }
        }
      }

      // Update user's profile photo in database
      const updatedUser = await User.findByIdAndUpdate(
        req.user.userId,
        { profilePhoto: imagePath },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        throw new Error("Failed to update user profile");
      }

      console.log("Updated user profile:", updatedUser);
      res.json({
        imagePath,
        message: "Profile picture updated successfully",
        user: updatedUser,
      });
    } catch (err) {
      console.error("Profile picture upload error:", err);
      res.status(500).json({
        message: "Failed to upload profile picture",
        error: err.message,
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    }
  }
);

module.exports = router;
