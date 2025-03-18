const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Protect routes
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header - check for both formats
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.authorization) {
      token = req.headers.authorization;
    }
    
    // Check if token exists
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
      
      // Find user
      const user = await User.findById(decoded.id || decoded.userId);
      
      if (!user) {
        console.log('User not found with ID from token');
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Check if user is active
      if (user.isActive === false) {
        return res.status(403).json({ message: "Account is disabled" });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      
      if (error.name === 'JsonWebTokenError') {
        // For debugging only - don't include in production
        console.log('JWT Secret:', process.env.JWT_SECRET);
        console.log('Token received:', token);
      }
      
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

module.exports = { protect, admin }; 