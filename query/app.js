const express = require("express");
const app = express();
const { randomBytes } = require("crypto");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

app.use(bodyParser.json());
app.use(cors());

const posts = [];

function handleEvents(type, data) {
  if (type === `PostCreated`) {
    posts.push({ postId: data.id, post: data.title, comments: [] });
  }
  if (type === `CommentCreated`) {
    const { id, content, postId, status } = data;

    const currentPosts = posts.filter((post) => post.postId === postId);

    currentPosts[0].comments.push({
      commentId: id,
      content,
      status,
    });
  }

  if (type === `CommentUpdated`) {
    const { id, content, status, postId } = data;

    const currentPosts = posts.filter((post) => post.postId === postId);

    console.log(currentPosts);
    const currentComment = currentPosts[0]?.comments.find(
      (comment) => comment.commentId === id
    );
    console.log(currentComment);

    currentComment.status = status;
    currentComment.content = content;
  }
}

app.get(`/posts`, (req, res, next) => {
  res.status(200).json({
    status: `Success`,
    data: posts,
  });
});

app.post(`/events`, (req, res, next) => {
  const { type, data } = req.body;

  handleEvents(type, data);

  res.status(201).json({
    status: `Success`,
  });
});

const PORT = 2001;
app.listen(PORT, async () => {
  console.log(`Listening on ${PORT}...`);
  const res = await axios.get(`http://event-bus-srv:2500/events`);
  const data = await res.json();
  for (let event of data) {
    handleEvents(event.type, event.data);
  }
});
