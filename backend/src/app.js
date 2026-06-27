const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const accountRoutes=require("./routes/accountRoutes")

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/account",accountRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SecureBank API Running"
  });
});

module.exports = app;