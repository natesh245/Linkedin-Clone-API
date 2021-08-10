const router = require("express").Router();
const Profile = require("../models/profile");
const isUserAuthorized = require("../middlewares/profile");

router.get("/", async (req, res) => {
  try {
    if (!req?.user?.isAdmin) return res.status(401).send("Not Authorized");
    const profiles = await Profile.find({});
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/:profileId", isUserAuthorized, async (req, res) => {
  try {
    res.status(200).send(req.profile);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const existingUserProfile = await Profile.findOne({ user: userId }).lean();
    if (existingUserProfile)
      return res.status(403).send("Profile already exists");
    const userProfile = new Profile({
      user: userId,
      ...req.body,
    });
    const savedProfile = await userProfile.save();
    res.status(201).send(savedProfile);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put("/:profileId", isUserAuthorized, async (req, res) => {
  try {
    const profileId = req.params.profileId;
    const updatedProfile = await Profile.updateOne(
      { _id: profileId },
      { ...req.body },
      { useFindAndModify: true }
    );
    res.status(201).send(updatedProfile);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/:profileId", isUserAuthorized, async (req, res) => {
  try {
    const profileId = req.params.profileId;
    await Profile.deleteOne({ _id: profileId });
    res.status(201).send("profile deleted successfully");
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
