const mongoose = require("mongoose");

const positionsSchema = new mongoose.Schema({
  name: String,
  type: String,
  start: String,
  end: String,
  duration: String,
  place: String,
});

const experienceSchema = new mongoose.Schema({
  company: String,
  duration: String,
  companyLogo: String,
  positions: [positionsSchema],
});

const educationSchema = new mongoose.Schema({
  school: String,
  schoolImage: String,

  degree: String,
  field: String,
  start: String,
  end: String,
});

const profileSchema = new mongoose.Schema(
  {
    headline: {
      type: String,
    },
    current_position: {
      type: String,
    },
    country: {
      type: String,
    },
    location: {
      type: String,
    },
    industry: {
      type: String,
    },
    description: {
      type: String,
      maxLength: 2600,
    },
    experience: {
      type: [experienceSchema],
    },
    education: {
      type: [educationSchema],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Profile", profileSchema);
