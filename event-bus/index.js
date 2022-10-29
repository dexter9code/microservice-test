const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());

const events = [];

app.post(`/events`, (req, res, next) => {
  const event = req.body;

  events.push(event);

  axios.post(`http://posts-clusterip-srv:1717/events`, event);
  axios.post(`http://comments-srv:2000/events`, event);
  axios.post(`http://query-srv:2001/events`, event);
  axios.post(`http://moderation-srv:2002/events`, event);

  res.status(200).json({
    status: `Success`,
  });
});

app.get(`/events`, (req, res, next) => {
  res.status(200).json({
    status: `Success`,
    data: events,
  });
});

const PORT = 2005;
app.listen(PORT, () => console.log(`Listening on Port ${PORT}...`));
