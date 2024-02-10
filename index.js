const express = require("express");
const app = express();
const dotenv = require("dotenv")
dotenv.config()

const { RateLimiter } = require("./rate_limiter");

// enum: ["token_bucket" ,"leaky_bucket, "fixed_window", "sliding_window_log", "sliding_window_counter"]
let algorithm = "sliding_window_log";
const rateLimiterInst = new RateLimiter(algorithm, {
  intervalInSeconds: 60,
  maxRequestsPerInterval: 4,
});
const applyRateLimiter = rateLimiterInst.applyRateLimit.bind(rateLimiterInst);


app.get("/check-rate-limit", applyRateLimiter, function (req, res) {
  res.json({
    data: "3000",
    message: `Hello from Express Server ${process.pid}`,
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
