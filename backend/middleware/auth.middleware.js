const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
let  token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Token required" });
  }
   if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT secret is not configured. Set JWT_SECRET in your environment.');
      return res.status(500).json({ message: 'Server misconfiguration: JWT secret not set' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;