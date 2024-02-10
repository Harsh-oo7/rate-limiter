class FixedWindow {
  constructor(options) {
    this.options = options;
  }

  async checkRateLimit(req, res, next, userId, client) {
    const intervalInSeconds = this.options.intervalInSeconds; // Set your desired interval in seconds

    const currentWindow = Math.floor(
      Date.now() / 1000 / intervalInSeconds
    ).toString();

    const key = `${userId}:${currentWindow}`;
    const value = await client.get(key);

    if (value >= this.options.maxRequestsPerInterval) {
      res.status(429).json({
        message: "Too Many Requests",
      });
      return;
    }
    await client.incr(key);
    next();
  }
}

module.exports = FixedWindow;
