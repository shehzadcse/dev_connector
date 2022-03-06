const express = require("express");
const app = express();

app.get("/", (req, res) => {
  const myData = req.query;
  res.send(myData);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Started on port ${PORT}`);
});
