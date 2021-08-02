const router = require("express").Router();
const User = require("../models/user");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const { generateToken, hashPassword } = require("../utils/auth");

//get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get user by id
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).send("id is required");
  try {
    const user = await User.find({ _id: id }, { password: 0 });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

//create/register new user
router.post("/register", async (req, res) => {
  try {
    const body = req.body;
    const { first_name, last_name, password, email_id } = body;
    if (!first_name || !last_name || !password || !email_id)
      return res.send(
        "first_name,last_name, email_id and password fields are required"
      );
    const existingUser = await User.findOne({ email_id: body.email_id });
    if (existingUser)
      return res.status(405).send("Email id already exists , please login");
    const user = new User(body);
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    // const hashedPassword = await hashPassword(user.password);
    user.password = hashedPassword;
    const savedUser = await user.save();

    // const token = jwt.sign({ ...savedUser._doc, password: null }, "secret", {
    //   expiresIn: "2h",
    // });
    const token = await generateToken(savedUser._doc);
    // save user token
    savedUser._doc.token = token;

    res.send({ ...savedUser._doc, password: null });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email_id, password } = req.body;
    if (!email_id || !password)
      return res.send("email_id and password are required");
    const existingUser = await User.findOne({ email_id });

    if (!existingUser) {
      return res.send("User does not exist");
    }
    const match = await bcrypt.compare(password, existingUser.password);

    if (match) {
      // const token = await jwt.sign(
      //   { ...existingUser._doc, password: null },
      //   "secret",
      //   {
      //     expiresIn: "2h",
      //   }
      // );

      const token = await generateToken(existingUser._doc);

      res.status(200).send({ ...existingUser._doc, token });
    } else {
      res.send("wrong credentials");
    }
  } catch (error) {
    res.send(error);
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { first_name, last_name, email_id, password } = req.body;
  try {
    const savedUser = await User.findOne({ _id: id }, { password: 0 });
    const updateObj = {};
    if (first_name) updateObj.first_name = first_name;
    if (last_name) updateObj.last_name = last_name;
    if (email_id) updateObj.email_id = email_id;
    if (password) {
      // const salt = await bcrypt.genSalt(saltRounds);
      // const hashedPassword = await bcrypt.hash(password, salt);

      const hashedPassword = await hashPassword(password);
      updateObj.password = hashedPassword;
    }

    if (Object.keys(updateObj).length > 0) {
      let updatedUser = await User.findByIdAndUpdate(id, updateObj);

      return res.send(updatedUser);
    }
    return res.send(savedUser);
  } catch (error) {
    return res.sendStatus(500).send(error);
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const deletedUser = await User.deleteOne({ _id: id });
    res.status(200).send("user deleted succesfully");
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
