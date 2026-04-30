export const handler = async () => ({
  statusCode: 200,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    status: "ok",
    message: "FitChain backend API is running",
  }),
});
