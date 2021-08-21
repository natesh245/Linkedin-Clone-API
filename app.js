require("dotenv").config();
require("./config/database").dbConnect();

const userRoute = require("./routes/user");
const profileRoute = require("./routes/profile");

const verifyToken = require("./middlewares/auth");
const cors = require("cors");
const express = require("express");

const app = express();

app.use(cors());

//parse incoming request body as payload
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api/user", userRoute);
app.use("/api/profile", verifyToken, profileRoute);

module.exports = app;
