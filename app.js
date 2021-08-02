require("dotenv").config();
require("./config/database").dbConnect();

const userRoute = require("./routes/user");

const express = require("express");

const app = express();

//parse incoming request body as payload
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api/user", userRoute);

module.exports = app;
