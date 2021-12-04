const router = require("express").Router();
const Profile = require("../models/profile");
const User = require("../models/user");
const isUserAuthorized = require("../middlewares/profile");
const profile = require("../models/profile");

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

router.get("/search", async (req, res) => {
  try {
    let searchQuery = req.query.search;
    searchQuery = searchQuery.trim();
    if (!searchQuery)
      return res.status(400).json({
        data: null,
        status: 400,
        message: "search query is required",
      });

    const userResults = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        {
          first_name: {
            $regex: `^${searchQuery.split(" ")[0]}`,
            $options: "i",
          },
        },
        {
          last_name: {
            $regex: `^${searchQuery.split(" ")[1] || searchQuery}`,
            $options: "i",
          },
        },
      ],
    }).exec();

    let userIds = userResults.map((user) => user._id);
    const searchResults = await Profile.find(
      { user: { $in: userIds } },
      { headline: 1, avatarUrl: 1, user: 1 }
    )
      .populate({
        path: "user",
        select: "first_name last_name email_id headline",
      })
      .lean();
    res.status(200).json({
      data: searchResults,
      status: 200,
      message: "search result fetched sucessfully",
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
      .populate({ path: "user", select: "_id first_name last_name email_id" });
    res.status(200).json({
      data: {
        ...profile,
        isCurrentUserProfile: String(profile.user._id) === req.user._id,
      },
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
      data: {
        ...existingUserProfile,
        isCurrentUserProfile: userId === req.user._id,
      },
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
      data: { ...savedProfile, isCurrentUserProfile: userId === req.user._id },
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
        data: {
          ...updateDoc,
          isCurrentUserProfile: String(updateDoc.user) === req.user._id,
        },
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
