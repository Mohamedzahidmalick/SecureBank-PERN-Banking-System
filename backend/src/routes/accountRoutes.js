const express = require("express");
const router = express.Router();

const { getAccount,depositMoney } = require("../controllers/accountController");

router.get("/:userId", getAccount);
router.post("/deposit", depositMoney);  
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Account Route Working"
  });
});

module.exports = router;