const express = require("express");
const connectDB = require("./config/db");
const app = express();

connectDB();

app.get("/", (req, res) => {
  const myData = req.query;
  res.send(myData);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Started on port ${PORT}`);
});
