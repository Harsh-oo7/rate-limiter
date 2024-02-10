const Redis = require("ioredis");

async function getRedisConnection() {
  const client = new Redis(process.env.REDIS_URL);

  return client;
}

module.exports.getRedisConnection = getRedisConnection;
