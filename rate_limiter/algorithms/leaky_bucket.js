class LeakyBucket {
  constructor(options) {
    this.options = options;
  }

  async checkRateLimit(req, res, next, userId, client) {
    // let type = await client.exists(`${userId}-list`);

    let reqCount = await client.llen(`${userId}-list`);
    if (reqCount >= this.options.maxRequestsPerInterval) {
      res.status(429).json({
        message: "Too Many Requests",
      });
      return;
    }

    await client.rpush(`${userId}-list`, `${new Date().getTime()}`);

    next();
  }
}

module.exports = LeakyBucket;
