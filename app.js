require("dotenv").config();
require("./config/database").dbConnect();

const express = require("express");

const app = express();

//parse incoming request body as payload
app.use(express.json());

module.exports = app;
