const router = require("express").Router();
const User = require("../models/user");
const Profile = require("../models/profile");

const bcrypt = require("bcrypt");

const saltRounds = 10;

const { generateToken, hashPassword } = require("../utils/auth");

//get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });

    res.status(200).json({
      status: 200,
      data: users,
      message: "Users fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ status: 500, data: null, message: error });
  }
});

//get user by id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).send("id is required");
    const user = await User.findOne({ _id: id }, { password: 0 });
    res
      .status(200)
      .json({ status: 200, data: user, message: "user fetched successfully" });
  } catch (error) {
    res.status(500).json({ status: 500, data: null, message: error });
  }
});

//create/register new user
router.post("/register", async (req, res) => {
  try {
    const body = req.body;
    const { first_name, last_name, password, email_id } = body;
    if (!first_name || !last_name || !password || !email_id)
      return res.status(400).json({
        status: 400,
        data: null,
        message: "All fields are mandatory",
      });
    const existingUser = await User.findOne({ email_id: body.email_id });
    if (existingUser)
      return res.status(405).json({
        status: 405,
        message: "Email id already exists , please login",
        data: null,
      });
    const user = new User(body);
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    const savedUser = await user.save();
    if (savedUser) {
      const profile = new Profile({ user: savedUser._doc._id });
      await profile.save();
    }

    const token = await generateToken(savedUser._doc);
    savedUser._doc.token = token;
    res.status(201).json({
      data: { ...savedUser._doc, password: null },
      status: 201,
      message: "user registerd successfully",
    });
  } catch (error) {
    res.status(500).json({ status: 500, data: null, message: error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email_id, password } = req.body;
    if (!email_id || !password)
      return res.status(400).json({
        message: "email_id and password are required",
        status: 400,
        data: null,
      });
    const existingUser = await User.findOne({ email_id });

    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "User does not exist", status: 404, data: null });
    }
    const match = await bcrypt.compare(password, existingUser.password);

    if (match) {
      const token = await generateToken(existingUser._doc);
      return res.status(200).json({
        data: { ...existingUser._doc, token },
        status: 200,
        message: "User Login successfull",
      });
    } else {
      return res
        .status(401)
        .json({ status: 401, message: "wrong credentials", data: null });
    }
  } catch (error) {
    res.status(500).json({ status: 500, data: null, message: error });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res.status(400).json({
        data: null,
        status: 400,
        message: "user id is required",
      });
    const { first_name, last_name, email_id, password } = req.body;
    const savedUser = await User.findOne({ _id: id }, { password: 0 });
    if (!savedUser)
      return res.status(200).json({
        data: null,
        status: 404,
        message: "user does not exist",
      });
    const updateObj = {};
    if (first_name) updateObj.first_name = first_name;
    if (last_name) updateObj.last_name = last_name;
    if (email_id) updateObj.email_id = email_id;
    if (password) {
      const hashedPassword = await hashPassword(password);
      updateObj.password = hashedPassword;
    }

    let updatedUser = await User.findByIdAndUpdate(id, updateObj);
    updatedUser.password = null;

    return res.status(200).json({
      data: updatedUser,
      status: 200,
      message: "user updated successfully",
    });
  } catch (error) {
    res.status(500).json({ status: 500, data: null, message: error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res.status(400).json({
        data: null,
        status: 400,
        message: "user id is required",
      });
    await User.deleteOne({ _id: id });
    await Profile.deleteOne({ user: id });
    res
      .status(200)
      .json({ message: "user deleted succesfully", status: 200, data: null });
  } catch (error) {
    res.status(500).json({ status: 500, data: null, message: error });
  }
});

module.exports = router;
