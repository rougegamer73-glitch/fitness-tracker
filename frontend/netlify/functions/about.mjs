export const handler = async () => ({
  statusCode: 200,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "FitChain",
    description: "Pure blockchain-backed fitness tracker DApp",
    backend: "Minimal API (Netlify Functions)",
    endpoints: ["/api/health", "/api/about"],
  }),
});
