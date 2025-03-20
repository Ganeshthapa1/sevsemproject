const isVendor = (req, res, next) => {
  if (!req.user.isVendor) {
    return res.status(403).json({ message: "Access denied. Vendor only." });
  }
  next();
};

module.exports = isVendor; 