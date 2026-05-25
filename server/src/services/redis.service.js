import { createClient } from "redis";

let redisClient;
let connectionPromise;

const buildRedisClient = () => {
  const url = process.env.REDIS_URL;
  if (!url) {
    return null;
  }

  const client = createClient({ url });
  client.on("error", (error) => {
    console.error("Redis error:", error.message);
  });

  return client;
};

export const connectRedis = async () => {
  if (!redisClient) {
    redisClient = buildRedisClient();
  }

  if (!redisClient) {
    return null;
  }

  if (!connectionPromise && !redisClient.isOpen) {
    connectionPromise = redisClient.connect().catch((error) => {
      connectionPromise = null;
      console.error("Redis connection failed:", error.message);
      return null;
    });
  }

  if (connectionPromise) {
    await connectionPromise;
  }

  return redisClient;
};

export const getRedisClient = async () => connectRedis();

export const setJson = async (key, value, ttlSeconds) => {
  const client = await getRedisClient();
  if (!client || !client.isOpen) {
    return false;
  }

  const options = ttlSeconds ? { EX: ttlSeconds } : undefined;
  await client.set(key, JSON.stringify(value), options);

  return true;
};

export const getJson = async (key) => {
  const client = await getRedisClient();
  if (!client || !client.isOpen) {
    return null;
  }

  const value = await client.get(key);
  return value ? JSON.parse(value) : null;
};

export const deleteKey = async (key) => {
  const client = await getRedisClient();
  if (!client || !client.isOpen) {
    return 0;
  }

  return client.del(key);
};

export const pushList = async (key, value, ttlSeconds, maxItems = 20) => {
  const client = await getRedisClient();
  if (!client || !client.isOpen) {
    return false;
  }

  await client.rPush(key, JSON.stringify(value));
  await client.lTrim(key, -maxItems, -1);
  await client.expire(key, ttlSeconds);

  return true;
};

export const getList = async (key) => {
  const client = await getRedisClient();
  if (!client || !client.isOpen) {
    return [];
  }

  const items = await client.lRange(key, 0, -1);
  return items.map((item) => JSON.parse(item));
};

export const getValue = async (key) => {
  const client = await getRedisClient();
  if (!client || !client.isOpen) {
    return null;
  }

  return client.get(key);
};

export const setValue = async (key, value, ttlSeconds, options = {}) => {
  const client = await getRedisClient();
  if (!client || !client.isOpen) {
    return false;
  }

  const setOptions = {};
  if (ttlSeconds) {
    setOptions.EX = ttlSeconds;
  }
  if (options.onlyIfNotExists) {
    setOptions.NX = true;
  }

  const result = await client.set(key, value, setOptions);
  return result === "OK";
};

export const runWithRedisLock = async (key, ttlSeconds, handler) => {
  const lockAcquired = await setValue(key, "locked", ttlSeconds, {
    onlyIfNotExists: true,
  });

  if (!lockAcquired) {
    return null;
  }

  try {
    return await handler();
  } finally {
    await deleteKey(key);
  }
};
