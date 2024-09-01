const claimDailyReward = require('./claimDailyReward');
const claimFarmReward = require('./claimFarmReward');
const claimGamePoints = require('./claimGamePoints');
const claimTaskReward = require('./claimTaskReward');
const getBalance = require('./getBalance');
const getGameId = require('./getGameId');
const getTasks = require('./getTasks');
const getToken = require('./getToken');
const getTribe = require('./getTribe');
const getUsername = require('./getUsername');
const startFarmingSession = require('./startFarmingSession');
const startTask = require('./startTask');

module.exports = {
    claimDailyReward,
    claimFarmReward,
    claimGamePoints,
    claimTaskReward,
    getBalance,
    getGameId,
    getTasks,
    getToken,
    getTribe,
    getUsername,
    startFarmingSession,
    startTask
}