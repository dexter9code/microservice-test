const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

app.post(`/events`, async (req, res, next) => {
  const { type, data } = req.body;

  if (type === "CommentCreated") {
    const status = data.content.includes("orange") ? `rejected` : `approved`;

    try {
      await axios.post(`http://event-bus-srv:2005/events`, {
        type: `CommentModerated`,
        data: {
          id: data.id,
          content: data.content,
          postId: data.postId,
          status,
        },
      });
    } catch (error) {
      console.log(error.message);
    }

    res.status(200).json({ status: `Success` });
  }
});

const PORT = 2002;
app.listen(PORT, () => console.log(`Listening on Port ${PORT}...`));
