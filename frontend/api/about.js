module.exports = (req, res) => {
  res.status(200).json({
    name: "FitChain",
    description: "Pure blockchain-backed fitness tracker DApp",
    backend: "Minimal API (Vercel serverless)",
    endpoints: ["/api/health", "/api/about"],
  });
};
