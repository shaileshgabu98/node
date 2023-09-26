const Redis = require('ioredis');

// Redis configuration
const redisConfig = {
    host: '192.168.1.71',
    port: 6370,
    password: 'creditt_development_123',
};
// Redis client
const redisClient = new Redis(redisConfig);

// Testing the connection
redisClient.ping().then(() => {
    console.log('Connected to Redis server');
}).catch((error) => {
    console.error('Error connecting to Redis:', error);
});

redisClient.set('exampleKey', 'exampleValue', (error, result) => {
    if (error) {
        console.error('Error setting key:', error);
    } else {
        console.log('Key set successfully:', result);
    }

    // Close the Redis connection when done
    redisClient.quit();
});