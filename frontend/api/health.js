module.exports = (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "FitChain backend API is running",
  });
};
