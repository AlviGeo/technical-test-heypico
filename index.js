const express = require("express");

require("dotenv").config();

const locationRoutes = require("./src/routes");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.use("/", locationRoutes);
app.use(express.static("public"));
// app.all("/", function (req, res) {
//   return res.json({ message: "Success" });
// });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
