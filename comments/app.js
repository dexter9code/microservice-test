const express = require("express");
const app = express();
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");

// app.use(express.json({ limit: `10kb` }));
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = [];

app.get(`/posts/:id/comments`, (req, res, next) => {
  const id = req.params.id;

  const currentIdPosts = commentsByPostId.filter(
    (comments) => comments.postId === id
  );

  res.status(200).json({
    status: `Success`,
    data: currentIdPosts,
  });
});

app.post(`/posts/:id/comments`, async (req, res, next) => {
  const postId = req.params.id;
  const id = randomBytes(4).toString("hex");
  const { content } = req.body;

  commentsByPostId.push({ id, content, postId, status: `pending` });

  const latestComment = commentsByPostId.at(-1);

  try {
    await axios.post(`http://localhost:2005/events`, {
      type: `CommentCreated`,
      data: { id, content, postId, status: `pending` },
    });
  } catch (error) {
    console.log(error.message);
  }

  res.status(201).json({
    status: `Success`,
    data: latestComment,
  });
});

app.post(`/events`, async (req, res, next) => {
  const { type, data } = req.body;

  if (type === `CommentModerated`) {
    const { id, postId, status, content } = data;
    const currentPost = commentsByPostId.filter(
      (post) => post.postId === postId
    );
    const currentComment = currentPost.find((comment) => comment.id === id);
    currentComment.status = status;

    try {
      await axios.post(`http://event-bus-srv:2005/events`, {
        type: `CommentUpdated`,
        data: {
          id,
          content,
          postId,
          status,
        },
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  res.status(200).json({
    status: `Success`,
  });
});

const PORT = 2000;
app.listen(PORT, () => console.log(`Listening on the port ${PORT}`));
