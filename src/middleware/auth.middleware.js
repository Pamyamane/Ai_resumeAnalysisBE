const jwt = require("jsonwebtoken");
const BlacklistToken = require("../models/blacklist.model");


  async function authMiddleware (req, res, next) {

    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const blacklistedToken = await BlacklistToken.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({
        message: "Session expired. Please login again.",
      });
    }
    if (token) {
        try {
            const decoded = jwt.verify(token, 8329980098);
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }
    } 
}

module.exports = {authMiddleware};