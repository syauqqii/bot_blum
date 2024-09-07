require('dotenv').config();
const readline = require('readline');

const { setupCronJob, setupBalanceCheck, setupDailyReward, setupFarmReward } = require('./cronJob');
const { getAllQueryIds, extractQueryIds } = require('./fileHandler');
const { formatDate, sleep, retry, spinner } = require('./helpers');

const {
    claimDailyReward, claimFarmReward, claimGamePoints, claimTaskReward, getBalance,
    getGameId, getTasks, getToken, getUsername, startFarmingSession, startTask
    // , getTribe
} = require('./api');

const { header, menu } = require('./config/view');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const JSON_FILE_NAME = process.env.JSON_FILE_NAME || 'blumAccount.json';

const MAX_DELAY_PER_TASK = parseInt(process.env.MAX_DELAY_PER_TASK) || 5;
const MIN_DELAY_PER_TASK = parseInt(process.env.MIN_DELAY_PER_TASK) || 3;

const MAX_POINT = parseInt(process.env.MAX_POINT) || 221;
const MIN_POINT = parseInt(process.env.MIN_POINT) || 197;

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

let cronJobRunning = false;
let cronJobID = 0;
let cronJobQueries = "";

(async () => {
    let choice;

    while (true) {
        if (!cronJobRunning) {
            console.clear(); header(); menu();

            choice = await askQuestion(' ? Choose: (0-6) ');

            // @MENU : (Not 0-6) - Invalid
            if (!/^[0-6]$/.test(choice)) {
                await askQuestion('\n ! Invalid choice. Press [ENTER]'); continue;
            }

            // @MENU : 0 - Exit Program
            if (choice === '0') process.exit();

            // @MENU : 1 - Add Account
            if (choice === '1') {
                console.clear(); header(parseInt(choice));

                await extractQueryIds(JSON_FILE_NAME, await askQuestion('   + Input URL: '));
                await askQuestion('\n > Process completed. Press [ENTER]');
            }

            // @MENU : 2, 3, 4, 5, 6 - Validation
            if (['2', '3', '4', '5', '6'].includes(choice)) {
                console.clear(); header(parseInt(choice));
                const queryData = getAllQueryIds(JSON_FILE_NAME);

                if (!queryData || queryData.length === 0) {
                    await askQuestion('\n ! Add account please. Press [ENTER]'); continue;
                }

                console.log('   # List of accounts:');
                queryData.forEach((account, index) => {
                    console.log(`      ${index + 1}. @${account.username}`);
                });
                console.log('\n      0. Main menu');

                const accountChoice = await askQuestion('\n   ? Choose an account: (0-' + queryData.length + ') ');

                if (accountChoice == '0') continue;

                if (!/^[0-9]\d*$/.test(accountChoice) || accountChoice < 0 || accountChoice > queryData.length) {
                    await askQuestion('\n ! Invalid choice! [ENTER]');
                    continue;
                }

                const queries = queryData[accountChoice - 1].query_id;
                cronJobQueries = queries;
                token = await retry(() => getToken(queries), 'getToken');
                const username = await retry(() => getUsername(token), 'getUsername');
                const balance = await retry(() =>getBalance(token), 'getBalance');

                // @MENU: 2 - Claim Daily Reward
                if (choice == '2') {
                    const reward = await retry(() => claimDailyReward(token), 'claimDailyReward');

                    if (reward) {
                        console.log(`\n   # Daily reward claimed successfully!`);
                    }

                    console.log(`   $ Balance '@${username}': ${balance.availableBalance} BP`);
                    const runAgain = await askQuestion('\n   ? Run daily reward claim auto 24h? (y/n): ');

                    if (['yes', 'ye', 'y'].includes(runAgain.toLowerCase())) {
                        cronJobID = 1; cronJobRunning = true;
                        break;
                    }
                }
                
                // @MENU: 3 - Auto Playing Tickets
                if (choice == '3') {
                    let i = 0;
                    if (balance.playPasses > 0) {
                        let counter = balance.playPasses;
                        while (counter > 0) {
                            i++;
                            try {
                                const gameData = await retry(() => getGameId(token), 'getGameId', 10);

                                console.log(); await spinner(60000, i, balance.playPasses);

                                const randPoints = Math.floor(Math.random() * (MAX_POINT - MIN_POINT + 1)) + MIN_POINT;
                                const letsPlay = await retry(() => claimGamePoints(token, gameData.gameId, randPoints), 'claimGamePoints');
                                
                                if (letsPlay === 'OK') {
                                    const balance = await retry(() => getBalance(token), 'getBalance');
                                    console.log(`\n   > Success, balance: ${balance.availableBalance} (+${randPoints} BP)`);
                                }
                            } catch (error) {
                                console.error('   ! An error occurred:', error);
                                break;
                            }
                            counter--;
                        }
                        await askQuestion(`\n   > Done. [ENTER]`);
                        continue;
                    } else {
                        await askQuestion(`\n   ! You can't play, you have ${balance.playPasses} chance(s). [ENTER]`);
                        continue;
                    }
                }
                
                // @MENU: 4 - Auto Task
                if (choice == '4') {
                    const tasksData = await retry(() => getTasks(token), 'getTasks');
                    console.log();

                    for (const category of tasksData) {
                        for (const task of category.tasks) {
                            if (task.status === 'NOT_STARTED') {
                                const startedTask = await retry(() => startTask(token, task.id, task.title), 'startTask');
                    
                                if (startedTask) {
                                    console.log(`   # Task "${startedTask.title}" has been started!`);
                    
                                    try {
                                        const claimedTask = await retry(() => claimTaskReward(token, task.id), 'claimTaskReward', 2);
                                        console.log(`     Task "${claimedTask.title}" has been claimed!`);
                                        console.log(`     Reward: ${claimedTask.reward} BP`);
                                    } catch (error) {
                                        console.log(`   # Unable to claim task "${task.title}", please try to claim it manually.`);
                                    }
                                }

                                console.log();
                            } else if (['STARTED', 'READY_FOR_CLAIM'].includes(task.status)) {
                                try {
                                    const claimedTask = await retry(() => claimTaskReward(token, task.id), 'claimTaskReward', 2);
                    
                                    console.log(`   > Task "${claimedTask.title}" has been claimed!`);
                                    console.log(`   > Reward: ${claimedTask.reward} BP`);
                                } catch (error) {
                                    console.log(`   ! Unable to claim task "${task.title}".`);
                                }

                                console.log();
                            }
                            await sleep(Math.floor(Math.random() * (MAX_DELAY_PER_TASK - MIN_DELAY_PER_TASK + 1)) + MIN_DELAY_PER_TASK);
                        }
                    }

                    await askQuestion('\n   # Back to main menu [ENTER]');
                }
                
                // @MENU: 5 - Claim Farm Reward
                if (choice == '5') {
                    const claimResponse = await retry(() => claimFarmReward(token), 'claimFarmReward');

                    if (claimResponse) {
                        console.log('\n   # Farm reward claimed successfully!');
                    }

                    const runAgain = await askQuestion('   ? Run farm reward claim every 9 hours? (y/n): ');

                    if (['yes', 'ye', 'y'].includes(runAgain.toLowerCase())) {
                        cronJobID = 2; cronJobRunning = true;
                        break;
                    }
                }
                
                // @MENU: 6 - Start Farming Session
                if (choice == '6') {
                    try {
                        await retry(() => startFarmingSession(token), 'startFarmingSession');
                        console.log(`\n   # Farming session started!`);

                        cronJobID = 3; cronJobRunning = true;
                    } catch (error) {
                        console.error('   ! Error setting up cron jobs:', error);
                    }

                    break;
                }
            }
        }
    }

    if (cronJobRunning) {
        rl.close();

        if (cronJobID == 1){
            setupDailyReward(cronJobQueries)
        }

        if (cronJobID == 2){
            setupFarmReward(cronJobQueries)
        }

        if (cronJobID == 3){
            await Promise.all([
                setupCronJob(cronJobQueries),
                setupBalanceCheck(cronJobQueries)
            ]);
        }
    }
})();