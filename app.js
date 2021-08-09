require("dotenv").config();
require("./config/database").dbConnect();

const userRoute = require("./routes/user");
const profileRoute = require("./routes/profile");

const verifyToken = require("./middlewares/auth");

const express = require("express");

const app = express();

//parse incoming request body as payload
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api/user", userRoute);
app.use("/api/profile", verifyToken, profileRoute);

module.exports = app;
