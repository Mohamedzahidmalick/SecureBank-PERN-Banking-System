const prisma = require("../config/prisma");

const getAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    const account = await prisma.account.findFirst({
      where: {
        userId: Number(userId)
      }
    });

    res.status(200).json({
      success: true,
      account
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

const depositMoney = async (req, res) => {
  try {
    const { accountNumber, amount } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero"
      });
    }

    const account = await prisma.account.findUnique({
      where: {
        accountNumber
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found"
      });
    }

    const updatedAccount = await prisma.account.update({
      where: {
        accountNumber
      },
      data: {
        balance: {
          increment: Number(amount)
        }
      }
    });
    console.log(updatedAccount);

    res.status(200).json({
      success: true,
      message: "Deposit successful",
      balance: updatedAccount.balance
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

module.exports = {
  getAccount,
  depositMoney
};