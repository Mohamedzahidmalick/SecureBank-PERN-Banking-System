const express = require("express");
const router = express.Router();

const {
  getAccount,
  depositMoney,
  withdrawMoney,
  transferMoney,
  getTransactionHistory,
} = require("../controllers/accountController");

router.post("/deposit", depositMoney);
router.post("/withdraw", withdrawMoney);
router.post("/transfer", transferMoney);
router.get("/transactions/:userId", getTransactionHistory);
const protect = require("../middleware/authMiddleware");

router.get("/protected", protect, (req, res) => {
  res.json({
    success: true,

    user: req.user,
  });
});
router.get("/:userId", getAccount);
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Account Route Working",
  });
});

module.exports = router;
