const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "FitChain backend API is running",
  });
});

app.get("/api/about", (req, res) => {
  res.json({
    name: "FitChain",
    description: "Pure blockchain-backed fitness tracker DApp",
    backend: "Minimal Express API",
    endpoints: ["/api/health", "/api/about"],
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`FitChain backend running on port ${PORT}`);
});