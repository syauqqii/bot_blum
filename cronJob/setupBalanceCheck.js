const cron = require('cron');
const { getBalance, getToken } = require('../api');

function setupBalanceCheck(queries) {
    return new Promise((resolve, reject) => {
        try {
            const job = new cron.CronJob('* * * * *', async () => {
                try {
                    const token = await getToken(queries);
                    const balance = await getBalance(token);

                    console.log(` - Updated farming balance: ${balance.farming.balance} BP (+ ${balance.farming.earningsRate} BP/s)`);
                } catch (error) {
                    console.error(' ! Error getting balance:', error);
                }
            });

            job.start();
            console.log(' - Balance check job set up to run every minute.');
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = setupBalanceCheck;