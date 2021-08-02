const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function hashPassword(password) {
  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error(error);
  }
}

async function generateToken(userDoc) {
  const token = jwt.sign({ ...userDoc, password: null }, "secret", {
    expiresIn: "2h",
  });

  return token;
}

module.exports = {
  hashPassword,
  generateToken,
};
