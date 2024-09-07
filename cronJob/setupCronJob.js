const cron = require('cron');
const { claimFarmReward, getToken } = require('../api');

function setupCronJob(queries) {
    return new Promise((resolve, reject) => {
        try {
            const job = new cron.CronJob('0 */9 * * *', async () => {
                try {
                    const token = await getToken(queries);
                    await claimFarmReward(token);

                    console.log('   - Farming reward claimed!');
                } catch (error) {
                    console.error('   ! Error claiming farming reward:', error);
                }
            });

            job.start();
            console.log('\n   - Cron job set up to run every 9 hours.');
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = setupCronJob;
