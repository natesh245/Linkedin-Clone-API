const Profile = require("../models/profile");

async function isUserAuthorized(req, res, next) {
  const profile = await Profile.findOne({ _id: req.params.profileId }).lean();
  if (profile) req.profile = profile;
  else {
    return res.status(404).json({
      data: null,
      status: 404,
      message: "Profile not found",
    });
  }
  if (!req.user.isAdmin && String(profile.user) !== req?.user?._id)
    return res.status(403).json({
      data: null,
      status: 403,
      message: "Forbidden",
    });
  next();
}

module.exports = isUserAuthorized;
