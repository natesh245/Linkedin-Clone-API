const mongoose = require("mongoose");

const positionsSchema = new mongoose.Schema({
  title: String,
  employment_type: String,
  start_date: {
    month: String,
    year: String,
  },
  end_date: {
    month: String,
    year: String,
  },

  location: String,
  description: {
    type: String,
    maxLength: 2000,
  },
});

const experienceSchema = new mongoose.Schema({
  company_name: String,
  positions: [positionsSchema],
});

const educationSchema = new mongoose.Schema({
  school: String,

  degree: String,
  field_of_study: String,
  start_date: {
    month: String,
    year: String,
  },
  end_date: {
    month: String,
    year: String,
  },
  grade: String,
  activities_and_societies: {
    type: String,
    maxLength: 500,
  },
  description: {
    type: String,
    maxLength: 1000,
  },
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
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Profile", profileSchema);
