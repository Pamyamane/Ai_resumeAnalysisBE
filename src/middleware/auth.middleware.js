const jwt = require("jsonwebtoken");
const BlacklistToken = require("../models/blacklist.model");

async function authMiddleware(req, res, next) {
  // Read token from cookie OR Authorization header
  const authHeader = req.headers.authorization;
  const token = req.cookies?.token || 
    (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const blacklistedToken = await BlacklistToken.findOne({ token });
  if (blacklistedToken) {
    return res.status(401).json({ message: "Session expired. Please login again." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = { authMiddleware };