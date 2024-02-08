const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const postSchema = mongoose.Schema({
  user_id: {
    type: String,
  },
  caption: {
    type: String,
    default: "",
  },
  image: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  likes_users: [
    {
      user_id: String,
      pfp: String,
      name: String,
    },
  ],
  comments_users: {
    type: Array,
  },
  likes: { type: Number, default: 0 },
  // comments_show: {
  //   type: Array,
  // },
  comments: [
    {
      text: String,
      author: String,
      pfp: String,
      postedBy: String,
      date: Date,
    },
  ],

  username: {
    type: String,
  },
  location: {
    type: String,
    default: "delhi",
  },
  pfp: {
    type: String,
  },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
