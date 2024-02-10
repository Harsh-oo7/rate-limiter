class SlidingWindowLog {
  constructor(options) {
    this.options = options;
  }

  async checkRateLimit(req, res, next, userId, client) {
    let intervalInSeconds = this.options.intervalInSeconds; // Set your desired interval in seconds
    const currentTime = Math.floor(Date.now() / 1000).toString();
    const lastWindowTime = (
      Math.floor(Date.now() / 1000) - intervalInSeconds
    ).toString();

    const key = `${userId}:'window_log'`;
    const result = await client.zcount(key, lastWindowTime, currentTime);

    if (result >= this.options.maxRequestsPerInterval) {
      res.status(429).json({
        message: "Too Many Requests",
      });
      return;
    }

    await client.zadd(key, currentTime, currentTime);
    next();
  }
}

module.exports = SlidingWindowLog;
