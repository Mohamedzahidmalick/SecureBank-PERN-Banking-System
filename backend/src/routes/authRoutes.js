const express = require("express");
const router = express.Router();

const { login ,signup } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth Route Working"
  });
});

module.exports = router;