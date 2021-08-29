const router = require("express").Router();
const Profile = require("../models/profile");
const isUserAuthorized = require("../middlewares/profile");

router.get("/", async (req, res) => {
  try {
    // if (!req?.user?.isAdmin) return res.status(401).send("Not Authorized");
    const profiles = await Profile.find({})
      .lean()
      .populate({ path: "user", select: "first_name last_name email_id" });
    res.status(200).json({
      data: profiles,
      status: 200,
      message: "profiles fetched sucessfully",
    });
  } catch (error) {
    res.status(500).json({ status: 500, data: null, message: error });
  }
});

router.get("/:profileId", async (req, res) => {
  try {
    const profileId = req.params.profileId;
    if (!profileId)
      return res.status(400).json({
        data: null,
        status: 400,
        message: "profile id is required",
      });
    const profile = await Profile.findOne({ _id: profileId })
      .lean()
      .populate({ path: "user", select: "first_name last_name email_id" });
    res.status(200).json({
      data: profile,
      status: 200,
      message: "profile fetched sucessfully",
    });
  } catch (error) {
    res.status(500).json({ status: 500, data: null, message: error });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId)
      return res.status(400).json({
        data: null,
        status: 400,
        message: "user id is required",
      });

    const existingUserProfile = await Profile.findOne({ user: userId }).lean();
    if (!existingUserProfile) {
      return res
        .status(404)
        .json({ data: null, status: 404, message: "profile does not exist" });
    }

    res.status(200).json({
      data: existingUserProfile,
      status: 200,
      message: "profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({ status: 500, data: null, message: error });
  }
});

router.post("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId)
      return res.status(400).json({
        data: null,
        status: 400,
        message: "user id is required",
      });
    if (userId !== String(req.user._id))
      return res.status(403).json({
        data: null,
        status: 403,
        message: "Forbidden",
      });
    const existingUserProfile = await Profile.findOne({ user: userId }).lean();
    if (existingUserProfile)
      return res.status(403).json({
        data: null,
        status: 400,
        message: "profile already exists",
      });
    const userProfile = new Profile({
      user: userId,
      ...req.body,
    });
    const savedProfile = await userProfile.save();
    res.status(200).json({
      data: savedProfile,
      status: 200,
      message: "profile saved successfully",
    });
  } catch (error) {
    res.status(500).json({ status: 500, data: null, message: error });
  }
});

router.put("/:profileId", isUserAuthorized, async (req, res) => {
  try {
    const profileId = req.params.profileId;
    if (!profileId)
      return res.status(400).json({
        data: null,
        status: 400,
        message: "profile id is required",
      });
    const updatedProfile = await Profile.findByIdAndUpdate(profileId, {
      ...req.body,
    });
    const updateDoc = await Profile.findOne({ _id: profileId }).lean();
    if (updatedProfile)
      res.status(200).json({
        data: { ...updateDoc },
        status: 200,
        message: "profile updated successfully",
      });
  } catch (error) {
    res.status(500).json({ status: 500, data: null, message: error });
  }
});

router.delete("/:profileId", isUserAuthorized, async (req, res) => {
  try {
    const profileId = req.params.profileId;
    if (!profileId)
      return res.status(400).json({
        data: null,
        status: 400,
        message: "profile id is required",
      });
    await Profile.deleteOne({ _id: profileId });
    res.status(201).json({
      message: "profile deleted succesfully",
      status: 200,
      data: null,
    });
  } catch (error) {
    res.status(500).json({ status: 500, data: null, message: error });
  }
});

module.exports = router;
