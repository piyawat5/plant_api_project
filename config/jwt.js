const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json();
    return;
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decode) => {
    if (err) {
      res.status(401).json();
      return;
    }
    next();
  });
};

module.exports = verifyToken;
