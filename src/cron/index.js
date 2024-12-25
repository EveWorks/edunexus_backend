const cron = require('node-cron');
const { User } = require('../models');

cron.schedule('0 0 * * *', async () => {
  // eslint-disable-next-line no-console
  console.log('Running a task every day at midnight');
  await User.updateMany({}, { dailyTokenLimit: 330000 });
});
