const setupCronJob = require('./setupCronJob');
const setupBalanceCheck = require('./setupBalanceCheck');
const setupFarmReward = require('./setupFarmReward');
const setupDailyReward = require('./setupDailyReward');

module.exports = {
    setupCronJob,
    setupBalanceCheck,
    setupFarmReward,
    setupDailyReward
};