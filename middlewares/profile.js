const Profile = require("../models/profile");

async function isUserAuthorized(req, res, next) {
  const profile = await Profile.findOne({ _id: req.params.profileId }).lean();
  if (profile) req.profile = profile;
  else {
    return res.status(404).send("Profile not Found");
  }
  if (!req.user.isAdmin && String(profile.user) !== req?.user?._id)
    return res.status(401).send("Not Authorized");
  next();
}

module.exports = isUserAuthorized;
