const express = require("express");
const app = express();
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");

const posts = [];

// app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.get(`/posts`, (req, res, next) => {
  res.status(200).json({
    status: `Success`,
    data: posts,
  });
});

app.post(`/posts`, async (req, res, next) => {
  const id = randomBytes(4).toString("hex");
  const { title } = req.body;
  posts.push({
    id,
    title,
  });

  try {
    await axios.post(`http://event-bus-srv:2005/events`, {
      type: `PostCreated`,
      data: { id, title },
    });
  } catch (error) {
    console.log(error.message);
  }

  res.status(201).json({
    status: `Success`,
    data: posts,
  });
});

app.post(`/events`, (req, res, next) => {
  console.log(`Recived:`, req.body.type);

  res.status(200).json({
    status: `Success`,
  });
});

const PORT = 1717;
app.listen(PORT, () => console.log(`Listening on the port ${PORT}`));
