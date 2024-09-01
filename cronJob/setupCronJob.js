const cron = require('cron');
const { claimFarmReward } = require('../api');

function setupCronJob(token) {
    return new Promise((resolve, reject) => {
        try {
            const job = new cron.CronJob('0 */10 * * *', async () => {
                console.log(' [-] Starting farming session every 10 hours...');

                try {
                    await claimFarmReward(token);
                    console.log(' [-] Farming reward claimed!');
                } catch (error) {
                    console.error(' [!] Error claiming farming reward:', error);
                }
            });

            job.start();
            console.log(' [-] Cron job set up to run every 10 hours.');
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = setupCronJob;