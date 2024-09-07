const cron = require('cron');
const { claimDailyReward, getToken } = require('../api');

function setupDailyReward(queries) {
    return new Promise((resolve, reject) => {
        try {
            const job = new cron.CronJob('0 0 * * *', async () => {
                console.log(' - Starting daily reward every 24 hours.');

                try {
                    const token = await getToken(queries);
                    const reward = await claimDailyReward(token);
                    
                    if (reward) {
                        console.log(' - Daily reward claimed successfully!');
                    } else {
                        console.log(' - No reward claimed. Perhaps already claimed today.');
                    }
                } catch (error) {
                    console.error(' ! Error claiming daily reward:', error);
                }
            });

            job.start();
            console.log(' - Daily reward cron job scheduled to run every 24 hours.');
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = setupDailyReward;