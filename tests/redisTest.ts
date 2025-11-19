import { createClient } from 'redis';

export const connectRedis = async () => {
  const client = createClient({
    url: "redis://alice:foobared@awesome.redis.server:6380"
  });

  client.on('error', err => console.log('Redis Client Error', err));

  await client.connect();
}