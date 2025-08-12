import configKeys from '../../../config';
import { createClient } from 'redis';

const connection = () => {
  const createRedisClient = () => {
    const client = createClient({
      url: configKeys.REDIS_URL,
    });

    client.on('error', err => 
      console.error("\x1b[31m%s\x1b[0m", 'Redis Client Error:', err)
    );

    client.connect()
      .then(() => {
        console.log("\x1b[41m\x1b[1m%s\x1b[0m", 'Redis connected successfully'); // background red + bold
      })
      .catch((err) => {
        console.error("\x1b[31m\x1b[1m%s\x1b[0m", 'Redis connection failed:', err); // red + bold
      });

    return client;
  };

  return {
    createRedisClient,
  };
};

export default connection;
