const cron = require('cron');
const { claimFarmReward, getToken } = require('../api');

function setupFarmReward(queries) {
    return new Promise((resolve, reject) => {
        try {
            const job = new cron.CronJob('0 */9 * * *', async () => {
                console.log(' - Starting farm reward every 9 hours.');
                
                try {
                    const token = await getToken(queries);
                    const reward = await claimFarmReward(token);
                    
                    if (reward) {
                        console.log(' - Farm reward claimed successfully!');
                    } else {
                        console.log(' - No reward claimed. Perhaps already claimed.');
                    }
                } catch (error) {
                    console.error(' ! Error claiming farm reward:', error);
                }
            });

            job.start();
            console.log(' - Farm reward cron job scheduled to run every 9 hours.');
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = setupFarmReward;