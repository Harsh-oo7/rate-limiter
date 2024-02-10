const {
  TokenBucket,
  LeakyBucket,
  FixedWindow,
  SlidingWindowLog,
  SlidingWindowCounter,
} = require("./algorithms");
const { getRedisConnection } = require("./redis.js");

class RateLimiter {
  constructor(algorithm, options) {

    this.algorithm = algorithm;
    this.options = options;

    this.TokenBucketInst = new TokenBucket(this.options);
    this.LeakyBucketInst = new LeakyBucket(this.options);
    this.FixedWindowInst = new FixedWindow(this.options);
    this.SlidingWindowLogInst = new SlidingWindowLog(this.options);
    this.SlidingWindowCounterInst = new SlidingWindowCounter(this.options);
  }

  async applyRateLimit(req, res, next) {
    let self = this;

    const userId = req?.query?.id;
    let RedisConnection = await getRedisConnection();

    switch (self.algorithm) {
      case "token_bucket":
        await self.TokenBucketInst.checkRateLimit(
          req,
          res,
          next,
          userId,
          RedisConnection
        );
        break;
      case "leaky_bucket":
        await self.LeakyBucketInst.checkRateLimit(
          req,
          res,
          next,
          userId,
          RedisConnection
        );
        break;
      case "fixed_window":
        await self.FixedWindowInst.checkRateLimit(
          req,
          res,
          next,
          userId,
          RedisConnection
        );
        break;
      case "sliding_window_log":
        await self.SlidingWindowLogInst.checkRateLimit(
          req,
          res,
          next,
          userId,
          RedisConnection
        );
        break;
      case "sliding_window_counter":
        await self.SlidingWindowCounterInst.checkRateLimit(
          req,
          res,
          next,
          userId,
          RedisConnection
        );
        break;
      default:
        next();
        break;
    }
  }
}

module.exports.RateLimiter = RateLimiter;
