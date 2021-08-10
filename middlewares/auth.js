const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  if (!token)
    return res.status(403).send("Token is required for authentication");
  try {
    const decodedToken = jwt.verify(token, "secret");
    req.user = decodedToken;
  } catch (error) {
    return res.status(401).send("Invalid Token");
  }
  return next();
}

module.exports = verifyToken;
