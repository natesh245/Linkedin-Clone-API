const router = require("express").Router();
const Profile = require("../models/profile");

router.get("/", async (req, res) => {
  try {
    if (!req?.user?.isAdmin) return res.status(401).send("Not Authorized");
    const profiles = await Profile.find({});
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const profileId = req.params.id;
    const profile = await Profile({ _id: profileId });
    if ((!req?.user?.isAdmin && profile) || profile.user !== req?.user?._id)
      return res.status(401).send("Not Authorized");

    res.status(200).send(profile);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const userProfile = new Profile({
      user: userId,
      ...req.body,
    });
    userProfile.save();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put("/:profileId", async (req, res) => {
  try {
    const profileId = req.params.profileId;

    const profile = await Profile({ _id: profileId });
    if ((!req?.user?.isAdmin && profile) || profile.user !== req?.user?._id)
      return res.status(401).send("Not Authorized");
    const updatedProfile = await Profile.updateOne(
      { _id: profileId },
      { ...req.body },
      { upsert: true, useFindAndModify: true }
    );
    res.status(201).send(updatedProfile);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/:profileId", async (req, res) => {
  try {
    const profileId = req.params.profileId;

    const profile = await Profile({ _id: profileId });
    if ((!req?.user?.isAdmin && profile) || profile.user !== req?.user?._id)
      return res.status(401).send("Not Authorized");
    await Profile.deleteOne({ _id: profileId });
    res.status(201).send("profile deleted successfully");
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
