const cron = require('cron');
const { getBalance } = require('../api');

function setupBalanceCheck(token) {
    return new Promise((resolve, reject) => {
        try {
            const job = new cron.CronJob('* * * * *', async () => {
                try {
                    const balance = await getBalance(token);
                    console.log(` [-] Updated farming balance: ${balance.farming.balance} BLUM`);
                } catch (error) {
                    console.error(' [!] Error getting balance:', error);
                }
            });

            job.start();
            console.log(' [-] Balance check job set up to run every minute.');
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = setupBalanceCheck;