const cron = require('cron');
const { claimFarmReward, getToken } = require('../api');

function setupCronJob(queries) {
    return new Promise((resolve, reject) => {
        try {
            const job = new cron.CronJob('0 */12 * * *', async () => {
                console.log(' - Starting farming session every 12 hours.');

                try {
                    const token = await getToken(queries);
                    await claimFarmReward(token);

                    console.log(' - Farming reward claimed!');
                } catch (error) {
                    console.error(' ! Error claiming farming reward:', error);
                }
            });

            job.start();
            console.log(' - Cron job set up to run every 12 hours.');
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = setupCronJob;
