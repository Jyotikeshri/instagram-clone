// import express from "express";
// import mongoose from "mongoose";
// import User from "./models/user.js";
// import Post from "./models/posts.js";
// import multer from "multer";
// import path from "path";
// import methodOverride from "method-override";

const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user.js");
const Post = require("./models/posts.js");
const path = require("path");
const bodyParser = require("body-parser");
const port = 8080;

// const Comment = require("./models/comments.js");

const methodOverride = require("method-override");

const app = express();

// Set up likes interactions

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
main()
  .then((res) => {
    console.log("Server is running...");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/instagram");
  console.log("server connnected");
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/logIn.html"));
});

app.get("/signUp", (req, res) => {
  res.render("signUp.ejs");
});

app.post("/", (req, res) => {
  let username = req.body.username;
  let fullname = req.body.fullName;
  let contact = req.body.contact;
  let password = req.body.password;
  console.log([username, fullname, contact, password]);
  User.insertMany([
    {
      username: username,
      fullname: fullname,
      contact: contact,
      password: password,
    },
  ])
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.error(err);
    });

  res.redirect("/");
});

// app.get("/posts/:id", (req, res) => {
//   const id = req.params.id;
//   User.findById(id).then((result) => {
//     const user = result;
//     Post.find({})
//       .then((post) => {
//         let posts = post;

//         console.log(posts);
//         res.render("index.ejs", { user, posts });
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   });
// });

// const likes = require("./public/count.js");

app.post("/posts", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  console.log({ username: username, password: password });
  const all_users = await User.find({});
  User.findOne({ username: username, password: password })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Invalid Credentials" });
      }
      console.log(user);
      Post.find({}).then((post) => {
        let posts = post;

        console.log(posts);

        res.render("index.ejs", { user, posts, all_users });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

// app.get("/posts", (req, res) => {
//   const user_id = req.params.user_id;
//   const post_id = req.params.post_id;
// });

app.get("/posts/:id", async (req, res) => {
  const user_id = req.params.id;
  const all_users = await User.find({});
  Post.find().then((ppp) => {
    User.findById(user_id).then((uuu) => {
      const posts = ppp;
      // console.log(user);
      const user = uuu;
      console.log(uuu);
      console.log(user);
      console.log(posts);
      res.render("index.ejs", { user, posts, all_users });
    });
  });
});
app.get("/posts/:id/new", async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);
  res.render("create.ejs", { id, user });
});
app.get("/posts/explore/posts/profile/:id", (req, res) => {
  const profileId = req.params.id;
  res.redirect(`/posts/profile/${profileId}`);
});
app.get("/show/post/posts/profile/:id", (req, res) => {
  const profileId = req.params.id;
  res.redirect(`/posts/profile/${profileId}`);
});

app.get("/posts/profile/:id", (req, res) => {
  const id = req.params.id;
  User.findOne({ _id: id }).then((profile) => {
    const follower_count = profile.followers.length;
    const following_count = profile.following.length;
    const user = profile;

    Post.find({ user_id: id })
      .then((posts) => {
        const post_count = posts.length;
        res.render("profile.ejs", {
          profile,
          follower_count,
          following_count,
          Posts: posts,
          post_count,
          user,
        });
      })
      .catch((err) => {
        console.log("Error finding posts:", err);
        res.status(500).send("Internal Server Error");
      });
  });
});
// Define a route for handling POST requests to "/posts/profile"
app.post("/posts/profile", async (req, res) => {
  try {
    // Extract data from the request body
    const filename = req.body.image;
    const caption = req.body.caption;
    const id = req.body.id;
    const location = req.body.location;

    // Find the user by id to get the username
    const user = await User.findById(id);

    // Check if the user is found
    // if (!user) {
    //   return res.status(404).send("User not found");
    // }

    const user_name = user.username;
    console.log(user_name);
    console.log(user.pfp);
    const pfpp = user.pfp;

    // Create a new post record in the database
    const createdPost = await Post.create({
      image: filename,
      caption: caption,
      user_id: id,
      date: new Date(),
      username: user_name,
      location: location,
      pfp: pfpp,
    });

    if (!createdPost) {
      throw new Error("Error Creating Post");
    }

    console.log("Post added to database", createdPost);
    res.redirect(`/posts/profile/${id}`);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/posts/profile/:id/edit", (req, res) => {
  const profileId = req.params.id;
  console.log(profileId);
  User.findOne({ _id: profileId })
    .then((foundProfile) => {
      if (!foundProfile) {
        return res.status(401).json({ msg: "No Profile found!" });
      }
      const post = foundProfile;
      console.log(post._id);
      res.render("edit.ejs", { post });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/posts/profile/new", (req, res) => {
  const newpfp = req.body.image;
  const id = req.body.id; // Log the id here
  console.log("User ID:", id); // Log the id to verify

  const bio = req.body.bio;
  const username = req.body.username;
  const gender = req.body.gender;

  User.findByIdAndUpdate(id, {
    username: username,
    gender: gender,
    bio: bio,
    pfp: newpfp,
  })
    .then((result) => {
      console.log(result);
      console.log("Redirecting to:", `/posts/profile/${id}`);
      res.redirect(`/posts/profile/${id}`);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
});

app.use(express.json());

app.patch("/likes", async (req, res) => {
  try {
    const postId = req.body.post_id;
    const userId = req.body.user_id;
    const posts = await Post.find({});
    const user = await User.findById(userId);

    // Check if the user has already liked the post
    const post = await Post.findById(postId);
    const hasLiked = post.likes_users.some((user) => user.user_id === userId);

    if (hasLiked) {
      // If the user has already liked, remove the like
      await Post.findByIdAndUpdate(postId, {
        $pull: { likes_users: { user_id: userId } },
      }).then((resultt) => {
        console.log("resultt", resultt);
        res.redirect(`/posts/${userId}`);
      });
      // res.json({ liked: false });
    } else {
      // If the user hasn't liked, add the like
      await Post.findByIdAndUpdate(postId, {
        $push: { likes_users: { user_id: userId } },
      }).then((resulttt) => {
        console.log("resulttt", resulttt);

        // res.redirect(`/posts/${userId}`);\
        res.render("liked.ejs", { user, posts });
      });
      // res.json({ liked: true });
    }
  } catch (err) {
    console.error("Error on like:", err);
    res.status(500).send({
      message: "Error on like!",
    });
  }
});

app.patch("/unlike", (req, res) => {
  const postId = req.body.post_id;
  const userId = req.body.user_id;
  console.log(userId);
  const likes_count = req.body.likesCount;

  Post.findByIdAndUpdate(
    postId,
    {
      $pull: { likes_users: userId },
    },
    {
      new: true,
    }
  )
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/comment/:id/:user_id", (req, res) => {
  const user_id = req.params.user_id;
  const post_id = req.params.id;
  Post.findById(post_id).then((posts) => {
    const post = posts;
    console.log(post);
    res.render("comment.ejs", { post, user_id });
  });
});

// app.post("/comments", (req, res) => {
//   const post_id = req.body.post_id;
//   const user_id = req.body.user_id;
//   const comment = req.body.comment;

//   const user = User.findById(user_id);

//   // Comment.create({user_id: user_id, comment: comment, post_id: post_id, pfp: })

//   Post.findByIdAndUpdate(
//     post_id,
//     {
//       $push: { comments_show: comment },
//     },
//     {
//       new: true,
//     }
//   ).then((response) => {
//     console.log(response);

//     res.redirect(`/posts/${user_id}`);
//   });
// });

app.post("/comments", async (req, res) => {
  const post_id = req.body.post_id;
  const user_id = req.body.user_id;
  console.log(user_id);
  const commentText = req.body.comment;
  console.log("commenttext", commentText);

  if (!post_id || !user_id || !commentText) {
    return res.status(400).json({ error: "Invalid request parameters" });
  }

  User.findById(user_id).then((use) => {
    const pfp = use.pfp;
    const username = use.username;
    Post.findById(post_id)
      .then((abc) => {
        // Create a new comment object
        const newComment = {
          text: commentText, // Replace with the actual comment text
          author: user_id,
          pfp: pfp,
          postedBy: username,
          date: Date.now(),
        };

        // Push the new comment to the comments array using $push
        Post.findByIdAndUpdate(
          post_id,
          {
            $push: { comments: newComment },
          },
          { new: true }
        )
          .then((result) => {
            console.log("Comment added to the database");
            console.log(result);
            const addedComment = result.comments[0];
            console.log("Added comment:", addedComment);
          })
          .catch((error) => {
            console.error("Error updating post:", error);
          });
      })
      .catch((error) => {
        console.error("Error finding post:", error);
      });
  });

  // if (!updatedPost) {
  //   return res.status(404).json({ error: "Post not found" });
  // }

  // console.log(user_id);
  // console.log(Post.comments);

  // Redirect to the post details or feed page
  res.redirect(`/posts/${user_id}`);
  // } catch (error) {
  //   console.error("Error adding comment:", error);
  //   res.status(500).json({ error: "Internal Server Error" });
  // }
});

// app.get("/posts/:id/edit", (req, res) => {

// Post.findById(id).then((result) => {
//   const post = result;
//   res.render("post_edit.ejs", { id, post });
// });
// });

app.post("/posts/:id/edit", (req, res) => {
  // const post_id = req.params.id;
  // const image = req.body.image;
  // const caption = req.body.caption;

  // Post.findByIdAndUpdate(
  //   post_id,
  //   { caption: caption, image: image },
  //   { new: true }
  // ).then((result) => {
  //   console.log(result);
  //   res.redirect(`/posts`);
  // });
  const id = req.params.id;
  Post.findById(id).then((result) => {
    const post = result;
    res.render("post_edit.ejs", { id, post });
  });
});

app.patch("/posts/:id", (req, res) => {
  const post_id = req.params.id;
  const image = req.body.image;
  const caption = req.body.caption;

  Post.findById(post_id)
    .then((post) => {
      if (!post) {
        return res.status(404).send({ message: "Post not found" });
      }

      const user_id = post.user_id; // Accessing user_id associated with the post

      Post.findByIdAndUpdate(
        post_id,
        { caption: caption, image: image },
        { new: true }
      )
        .then((updatedPost) => {
          if (!updatedPost) {
            return res.status(404).send({ message: "Post not found" });
          }

          res.redirect(`/posts/${user_id}`);
        })
        .catch((error) => {
          console.error("Error updating post:", error);
          res.status(500).send({ message: "Error updating post" });
        });
    })
    .catch((error) => {
      console.error("Error finding post:", error);
      res.status(500).send({ message: "Error finding post" });
    });
});

app.get("/profile/:id/:user_id/new", (req, res) => {
  const user_id = req.params.user_id;
  const id = req.params.id;
  User.findOne({ _id: id }).then((profile) => {
    const follower_count = profile.followers.length;
    const following_count = profile.following.length;

    User.findById(user_id).then((respond) => {
      const user = respond;
      Post.find({ user_id: id })
        .then((posts) => {
          const post_count = posts.length;
          res.render("followed.ejs", {
            profile,
            follower_count,
            following_count,
            Posts: posts,
            post_count,
            user,
          });
        })
        .catch((err) => {
          console.log("Error finding posts:", err);
          res.status(500).send("Internal Server Error");
        });
    });
  });
});

app.get("/profile/unfollow/:id/:user_id", (req, res) => {
  const user_id = req.params.user_id;
  const id = req.params.id;

  User.findById(user_id)
    .then((initiatingUser) => {
      const notification2 = {
        message: `${initiatingUser.username} unfollowed you !!`,
      };
      // Remove the initiating user from the followers list of the user to unfollow
      User.findByIdAndUpdate(
        id,
        {
          $pull: { followers: { follower_id: user_id } },
          $push: { Notification: notification2 },
        },
        { new: true }
      )
        .then((userToUnfollow) => {
          // Remove the user being unfollowed from the following list of the initiating user
          User.findByIdAndUpdate(
            user_id,
            {
              $pull: { following: { follow_id: id } },
            },
            { new: true }
          )
            .then((initiatingUserUpdated) => {
              console.log(
                "Follower removed from the database:",
                initiatingUserUpdated
              );
              // Redirect to the appropriate page
              res.redirect(`/posts/profile/${id}/${user_id}`);
            })
            .catch((error) => {
              console.error("Error updating initiating user:", error);
              res.status(500).send("Internal Server Error");
            });
        })
        .catch((error) => {
          console.error("Error updating user to unfollow:", error);
          res.status(500).send("Internal Server Error");
        });
    })
    .catch((error) => {
      console.error("Error finding initiating user:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/profile/follower/:id/:user_id", async (req, res) => {
  try {
    const { user_id, id } = req.params;

    const user = await User.findById(user_id);
    const followedUser = await User.findById(id);

    const follower = {
      follower_id: user_id,
      name: user.username,
      photo: user.pfp,
    };
    const notification = {
      message: `${user.username} followed you!!`,
    };

    await User.findByIdAndUpdate(
      id,
      {
        $push: { followers: follower },
        // $push: { Notification: notification },
      },
      { new: true }
    );

    const following = {
      follow_id: id,
      name: followedUser.username,
      photo: followedUser.pfp,
    };

    await User.findByIdAndUpdate(user_id, {
      $push: { following: following },
    });

    console.log("Follower added to the database");
    console.log("Added follower: in", followedUser.username, follower);
    console.log("Added following:", following);

    res.redirect(`/profile/${id}/${user_id}/new`);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/profile/:id/followers/:user_id", (req, res) => {
  const user_id = req.params.id;
  const profile_id = req.params.user_id;

  User.findById(profile_id).then((result) => {
    const user = result;
    User.findById(user_id).then((ress) => {
      const profile = ress;
      const followers = profile.followers;
      console.log("followers....", followers);
      res.render("follwers.ejs", {
        followers: followers,
        profile: profile,
        user,
      });
    });
  });
});

app.get("/profile/:id/followings/:user_id", (req, res) => {
  const user_id = req.params.id;
  const profile_id = req.params.user_id;

  User.findById(profile_id).then((result) => {
    const user = result;
    User.findById(user_id).then((ress) => {
      const profile = ress;
      const followings = profile.following;
      console.log("followers....", followings);
      res.render("following.ejs", {
        followings: followings,
        profile: profile,
        user,
      });
    });
  });
});

app.get("/posts/posts/profile/:id", (req, res) => {
  const id = req.params.id;
  User.findOne({ _id: id }).then((profile) => {
    const follower_count = profile.followers.length;
    const following_count = profile.following.length;

    Post.find({ user_id: id })
      .then((posts) => {
        const post_count = posts.length;
        res.render("profile.ejs", {
          profile,
          follower_count,
          following_count,
          Posts: posts,
          post_count,
        });
      })
      .catch((err) => {
        console.log("Error finding posts:", err);
        res.status(500).send("Internal Server Error");
      });
  });
});

app.delete("/posts/:id/delete", (req, res) => {
  const post_id = req.params.id;
  Post.findById(post_id).then((ress) => {
    const user_id = ress.user_id;
    // console.log("user_id", user_id);
    User.findById(user_id).then((resss) => {
      // console.log(resss, "user");
      Post.findByIdAndDelete(post_id).then((resullt) => {
        // console.log(resullt);
        res.redirect(`/posts/${user_id}`);
        // res.redirect("/posts/profile");
      });
    });
  });
});

// app.post("/followers", (req, res) => {
//   const profile_id = req.body.userId;
//   const user_id = req.body.profileId;
//   User.findById(profile_id).then((user) => {
//     const followers = user.followers;
//     User.findById(user_id).then((profile) => {
//       const profiles = profile;
//       res.render("follwers.ejs", { followers: followers, profile: profiles });
//     });
//   });
// });

app.get("/posts/profile/:id/:user_id", (req, res) => {
  const user_id = req.params.user_id;
  const id = req.params.id;

  User.findOne({ _id: id })
    .then((profile) => {
      const follower_count = profile.followers.length;
      const following_count = profile.following.length;

      User.findById(user_id)
        .then((respond) => {
          const user = respond;
          Post.find({ user_id: id })
            .then((posts) => {
              const post_count = posts.length;
              let template = "post_profile.ejs";

              // Check if the user with user_id is a follower
              for (let follower of profile.followers) {
                if (follower.follower_id == user_id) {
                  template = "followed.ejs";
                  break;
                }
              }

              res.render(template, {
                profile,
                follower_count,
                following_count,
                Posts: posts,
                post_count,
                user,
              });
            })
            .catch((err) => {
              console.log("Error finding posts:", err);
              res.status(500).send("Internal Server Error");
            });
        })
        .catch((err) => {
          console.log("Error finding user:", err);
          res.status(500).send("Internal Server Error");
        });
    })
    .catch((err) => {
      console.log("Error finding profile:", err);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/profile/:id/followings", (req, res) => {
  const user_id = req.params.id;
  const profile_id = req.params.id;

  User.findById(profile_id).then((result) => {
    const user = result;
    User.findById(user_id).then((ress) => {
      const profile = ress;
      const followings = profile.following;
      console.log("followers....", followings);
      res.render("following.ejs", {
        followings: followings,
        profile: profile,
        user,
      });
    });
  });
});

app.get("/profile/:id/followers", (req, res) => {
  const user_id = req.params.id;
  const profile_id = req.params.id;

  User.findById(profile_id).then((result) => {
    const user = result;
    User.findById(user_id).then((ress) => {
      const profile = ress;
      const followers = profile.followers;
      console.log("followers....", followers);
      res.render("follwers.ejs", {
        followers: followers,
        profile: profile,
        user,
      });
    });
  });
});

app.get("/posts/explore/:id", async (req, res) => {
  let user_id = req.params.id;
  const user = await User.findById(user_id);
  const all_posts = await Post.find({});
  res.render("explore.ejs", { user, all_posts });
});

app.get("/show/post/:id/:user_id", async (req, res) => {
  let postId = req.params.id;
  const userId = req.params.user_id;
  const post = await Post.findOne({ _id: postId });
  const user = await User.findOne({ _id: userId });
  res.render("show_post.ejs", { post, user });
});
