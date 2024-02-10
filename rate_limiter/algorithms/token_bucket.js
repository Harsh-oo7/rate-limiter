class TokenBucket {
  constructor(options) {
    this.options = options;
  }

  async checkRateLimit(req, res, next, userId, client) {
    const currentTimeInSeconds = parseInt(new Date().getTime() / 1000);

    const userData = await client.hgetall(`${userId}`);

    const userLastRequestTime =
      userData?.lastRequestTime ?? currentTimeInSeconds;

    if (
      currentTimeInSeconds - userLastRequestTime >=
      this.options.intervalInSeconds
    ) {
      let data = {
        lastRequestTime: currentTimeInSeconds,
        tokenCount: this.options.maxRequestsPerInterval - 1, // minus 1 for current request
      };
      await client.hset(`${userId}`, data);
      next();
      return;
    } else if (userData?.tokenCount <= 0) {
      res.status(429).json({
        message: "Too Many Requests",
      });
      return;
    }

    await client.hset(`${userId}`, {
      lastRequestTime: currentTimeInSeconds,
      tokenCount: userData.tokenCount - 1,
    });
    next();
  }
}

module.exports = TokenBucket;
