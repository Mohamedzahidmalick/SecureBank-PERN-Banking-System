const prisma = require("../config/prisma");

const getAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    const account = await prisma.account.findFirst({
      where: {
        userId: Number(userId),
      },
    });

    res.status(200).json({
      success: true,
      account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const depositMoney = async (req, res) => {
  try {
    const { accountNumber, amount } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    const account = await prisma.account.findUnique({
      where: {
        accountNumber,
      },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const updatedAccount = await prisma.account.update({
      where: {
        accountNumber,
      },
      data: {
        balance: {
          increment: Number(amount),
        },
      },
    });

    await prisma.transaction.create({
      data: {
        transactionType: "DEPOSIT",
        amount: Number(amount),
        receiverId: updatedAccount.id,
      },
    });
    console.log(updatedAccount);

    res.status(200).json({
      success: true,
      message: "Deposit successful",
      balance: updatedAccount.balance,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const withdrawMoney = async (req, res) => {
  try {
    const { accountNumber, amount } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    const account = await prisma.account.findUnique({
      where: { accountNumber },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (account.balance < Number(amount)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient Balance",
      });
    }

    const updatedAccount = await prisma.account.update({
      where: { accountNumber },
      data: {
        balance: {
          decrement: Number(amount),
        },
      },
    });

    await prisma.transaction.create({
      data: {
        transactionType: "WITHDRAW",
        amount: Number(amount),
        senderId: updatedAccount.id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Withdrawal successful",
      balance: updatedAccount.balance,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const transferMoney = async (req, res) => {
  try {
    const { senderAccountNumber, receiverAccountNumber, amount } = req.body;

    if (!senderAccountNumber || !receiverAccountNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    if (senderAccountNumber === receiverAccountNumber) {
      return res.status(400).json({
        success: false,
        message: "Cannot transfer to the same account",
      });
    }

    await prisma.$transaction(async (tx) => {
      const sender = await tx.account.findUnique({
        where: {
          accountNumber: senderAccountNumber,
        },
      });

      const receiver = await tx.account.findUnique({
        where: {
          accountNumber: receiverAccountNumber,
        },
      });

      if (!sender) {
        throw new Error("Sender account not found");
      }

      if (!receiver) {
        throw new Error("Receiver account not found");
      }

      if (sender.balance < Number(amount)) {
        throw new Error("Insufficient balance");
      }

      // Debit sender
      await tx.account.update({
        where: {
          accountNumber: senderAccountNumber,
        },
        data: {
          balance: {
            decrement: Number(amount),
          },
        },
      });

      // Credit receiver
      await tx.account.update({
        where: {
          accountNumber: receiverAccountNumber,
        },
        data: {
          balance: {
            increment: Number(amount),
          },
        },
      });

      // Save transaction
      await tx.transaction.create({
        data: {
          transactionType: "TRANSFER",
          amount: Number(amount),
          senderId: sender.id,
          receiverId: receiver.id,
        },
      });
    });

    res.status(200).json({
      success: true,
      message: "Money transferred successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const account = await prisma.account.findFirst({
      where: {
        userId: Number(userId),
      },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          {
            senderId: account.id,
          },
          {
            receiverId: account.id,
          },
        ],
      },

      include: {
        sender: {
          select: {
            accountNumber: true,
          },
        },
        receiver: {
          select: {
            accountNumber: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,

      transactions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,

      message: "Server Error",
    });
  }
};

const getMyAccount = async (req, res) => {
  try {

    const account = await prisma.account.findFirst({
      where: {
        userId: req.user.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found"
      });
    }

    res.status(200).json({
      success: true,
      account
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
  getMyAccount,
  depositMoney,
  withdrawMoney,
  transferMoney,
  getTransactionHistory
};
