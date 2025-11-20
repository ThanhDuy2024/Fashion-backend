import { createClient } from 'redis';
import 'dotenv/config'
const client = createClient({
    username: process.env.REDIS_USER_NAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: String(process.env.REDIS_URL),
        port: Number(process.env.REDIS_PORT)
    }
});

export const connectRedis = async () => {
  client.on('error', err => console.log('Redis Client Error', err));
  
  await client.connect();

  console.log("redis has been connected!");
}

export default client;