const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token)
      return res.status(401).json({
        data: null,
        status: 401,
        message: "Token is required for authentication",
      });
    const decodedToken = jwt.verify(token, "secret");
    req.user = decodedToken;
    return next();
  } catch (error) {
    return res.status(500).json({
      data: null,
      status: 500,
      message: "Invalid token",
    });
  }
}

module.exports = verifyToken;
