const cron = require('cron');
const { claimDailyReward } = require('../api');

function setupDailyReward(token) {
    return new Promise((resolve, reject) => {
        try {
            const job = new cron.CronJob('0 0 * * *', async () => {
                console.log(' [-] Running daily reward cron job!');

                try {
                    const reward = await claimDailyReward(token);
                    
                    if (reward) {
                        console.log(' [-] Daily reward claimed successfully!');
                    } else {
                        console.log(' [-] No reward claimed. Perhaps already claimed today.');
                    }
                } catch (error) {
                    console.error(' [!] Error claiming daily reward:', error);
                }
            });

            job.start();
            console.log(' [-] Daily reward cron job scheduled to run every 24 hours.');
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = setupDailyReward;