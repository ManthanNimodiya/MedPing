const { Queue } = require('bullmq');
const Redis     = require('ioredis');

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,   // required by BullMQ
});

const reminderQueue = new Queue('reminders', {
  connection,
  defaultJobOptions: {
    attempts:    3,             // retry up to 3 times
    backoff: {
      type:  'exponential',
      delay: 5000,              // 5s → 10s → 20s
    },
    removeOnComplete: { count: 1000 },
    removeOnFail:     { count: 500  },
  },
});

module.exports = { reminderQueue, connection };
