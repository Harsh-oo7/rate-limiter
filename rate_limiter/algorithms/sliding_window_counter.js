class SlidingWindowCounter {
  constructor(options) {
    this.options = options;
  }

  // verify this logic once
  async checkRateLimit(req, res, next, userId, client) {
    let intervalInSeconds = this.options.intervalInSeconds;
    let userID = userId;
    let maximumRequests = this.options.maxRequestsPerInterval;

    const now = Math.floor(Date.now() / 1000);
    const currentWindow = Math.floor(now / intervalInSeconds);
    const key = `${userID}:${currentWindow}:sliding_window_counter`;

    // Get current window count
    const requestCountCurrentWindow = parseInt(
      (await client.get(key)) || 0,
      10
    );

    if (requestCountCurrentWindow >= maximumRequests) {
      res.status(429).json({
        message: "Too Many Requests",
      });
      return;
    }

    const lastWindow = Math.floor(
      (now - intervalInSeconds) / intervalInSeconds
    );

    const lastKey = `${userID}:${lastWindow}:sliding_window_counter`;

    // Get last window count
    const requestCountLastWindow = parseInt(
      (await client.get(lastKey)) || 0,
      10
    );

    const elapsedTimePercentage = (now % intervalInSeconds) / intervalInSeconds;

    // Last window weighted count + current window count
    if (
      requestCountLastWindow * (1 - elapsedTimePercentage) +
        requestCountCurrentWindow >=
      maximumRequests
    ) {
      res.status(429).json({
        message: "Too Many Requests",
      });
      return;
    }

    // Increment request count by 1 in the current window
    await client.incr(key);

    // Handle request
    next();
  }
}

module.exports = SlidingWindowCounter;
