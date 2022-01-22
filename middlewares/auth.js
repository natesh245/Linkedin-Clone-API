const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token)
      return res.status(400).json({
        data: null,
        status: 400,
        message: "Bad Request- missing token",
      });
    const decodedToken = jwt.verify(token, "secret");
    req.user = decodedToken;
    return next();
  } catch (error) {
    return res.status(401).json({
      data: null,
      status: 401,
      message: "not authenticated",
    });
  }
}

module.exports = verifyToken;
