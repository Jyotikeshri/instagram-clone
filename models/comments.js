const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  comment: {
    type: Array,
  },
  user_id: {
    type: String,
  },
  post_id: {
    type: String,
  },
  pfp: {
    type: String,
  },
  username: {
    type: String,
  },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
