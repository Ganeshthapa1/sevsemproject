const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dqxvxqjqj",  // Replace with your actual cloud name
  api_key: "123456789012345",  // Replace with your actual API key
  api_secret: "abcdefghijklmnopqrstuvwxyz123456"  // Replace with your actual API secret
});

module.exports = cloudinary;
