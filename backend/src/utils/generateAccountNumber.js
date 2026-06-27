const generateAccountNumber = () => {
  return (
    "SB" +
    Math.floor(
      10000000 + Math.random() * 90000000
    )
  );
};

module.exports = generateAccountNumber;