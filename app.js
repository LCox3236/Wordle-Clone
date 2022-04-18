const express = require("express");
const app = express();
app.listen(8000, () =>
  console.log("Server Started, listening on http://localhost:8000")
);
app.use(express.static("game"));
