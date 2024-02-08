const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  fullname: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  followers: [
    {
      follower_id: String,
      name: String,
      photo: String,
    },
  ],
  following: [
    {
      follow_id: String,
      name: String,
      photo: String,
    },
  ],

  post_count: {
    type: Number,
    default: 0,
  },
  bio: {
    type: String,
  },
  gender: {
    type: String,
  },
  pfp: {
    type: String,
  },
  Notification: [
    {
      message: String,
      date: Date,
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
