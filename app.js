require('dotenv').config();
const readline = require('readline');

const { setupCronJob, setupBalanceCheck, setupDailyReward, setupFarmReward } = require('./cronJob');
const { getAllQueryIds, extractQueryIds } = require('./fileHandler');
const { formatDate } = require('./helper/formatDate');
const { sleep, retry } = require('./helper/helper');

const {
    claimDailyReward, claimFarmReward, claimGamePoints, claimTaskReward, getBalance,
    getGameId, getTasks, getToken, getUsername, startFarmingSession, startTask//, getTribe
} = require('./api');

const header = require('./config/header');
const menu = require('./config/menu');
const { getAllUsernames } = require('./fileHandler/getAllQueryIds');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const JSON_FILE_NAME = process.env.JSON_FILE_NAME || 'blum.json';

const MAX_DELAY_PER_TASK = parseInt(process.env.MAX_DELAY_PER_TASK) || 5;
const MIN_DELAY_PER_TASK = parseInt(process.env.MIN_DELAY_PER_TASK) || 3;

const MAX_POINT = parseInt(process.env.MAX_POINT) || 225;
const MIN_POINT = parseInt(process.env.MIN_POINT) || 192;

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

let cronJobRunning = false;

(async () => {
    let choice;

    while (true) {
        if (!cronJobRunning) {
            console.clear();
            header();
            menu();

            choice = await askQuestion(' [?] Choose a feature: (0-6) ');

            if (!/^[0-7]$/.test(choice)) {
                await askQuestion('\n [!] Invalid choice! [ENTER]');
                continue;
            }

            if (choice === '0') {
                console.log('\n [!] Exiting program.\n');
                process.exit();
            } else if (choice === '1') {
                console.clear();
                header(1);
                const url = await askQuestion(' [$] Input URL: ');
                await extractQueryIds(JSON_FILE_NAME, url);
                await askQuestion('\n [#] Process completed! [ENTER]');
            } else if (choice === '2') {
                console.clear();
                header(2);
                const queryData = getAllUsernames(JSON_FILE_NAME);
                
                if (!queryData || queryData.length === 0) {
                    await askQuestion('\n [!] No account found. Please add account first. [ENTER]');
                    continue;
                }

                console.log('\n [*] List of accounts:');
                queryData.forEach((username, _) => {
                    console.log(`     - @${username}`);
                });

                await askQuestion('\n [#] Process completed! [ENTER]');
            } else if (choice === '3' || choice === '4' || choice === '5' || choice === '6' || choice === '7') {
                console.clear();
                header(parseInt(choice));

                const queryData = getAllQueryIds(JSON_FILE_NAME);
                
                if (!queryData || queryData.length === 0) {
                    await askQuestion('\n [!] No account found. Please add account first. [ENTER]');
                    continue;
                }

                console.log('\n [*] List of accounts:');
                queryData.forEach((account, index) => {
                    console.log(`     ${index + 1}. @${account.username}`);
                });
                console.log('\n     0. Back to main menu');

                const accountChoice = await askQuestion('\n [?] Choose an account (0-' + queryData.length + '): ');

                if (!/^[0-9]\d*$/.test(accountChoice) || accountChoice < 0 || accountChoice > queryData.length) {
                    await askQuestion('\n [!] Invalid choice! [ENTER]');
                    continue;
                }

                if (accountChoice == '0') {
                    continue;
                }

                const selectedAccount = queryData[accountChoice - 1];
                const queries = selectedAccount.query_id;
                token = await retry(() => getToken(queries), 'getToken');
                const username = await retry(() => getUsername(token), 'getUsername');
                const balance = await retry(() =>getBalance(token), 'getBalance');

                if (choice == '3') {
                    console.clear();
                    header(parseInt(choice));
                    
                    const reward = await retry(() => claimDailyReward(token), 'claimDailyReward');

                    if (reward) {
                        console.log(` [#] Daily reward claimed successfully!`);
                    }

                    console.log(` [>] Balance '@${username}': ${balance.availableBalance}`);
                    const runAgain = await askQuestion('\n [#] Run daily reward claim auto 24h? (y/n): ');

                    if (runAgain.toLowerCase() === 'yes' || runAgain.toLowerCase() === 'y' || runAgain.toLowerCase() === 'ye') {
                        cronJobRunning = true;
                        console.log(' [-] Setting up daily reward cron job...');
                        setupDailyReward(token).then(() => {
                            console.log(' [-] Daily reward cron job has been completed.');
                            cronJobRunning = false;
                        }).catch(error => {
                            console.error(' [!] Error setting up daily reward cron job:', error);
                            cronJobRunning = false;
                        });

                        console.log(' [-] Cron job is set, exiting the main loop.');
                        break;
                    }
                } else if (choice == '4') {
                    console.clear();
                    header(parseInt(choice));
                    
                    let i = 0;
                    if (balance.playPasses > 0) {
                        let counter = balance.playPasses;
                        while (counter > 0) {
                            i++;
                            try {
                                const gameData = await retry(() => getGameId(token), 'getGameId', 10);
                                
                                console.log(`\n [>] Wait for 1 minute.. (${i}/${balance.playPasses})`);
                                await sleep(60000);

                                const randPoints = Math.floor(Math.random() * (MAX_POINT - MIN_POINT + 1)) + MIN_POINT;
                                const letsPlay = await retry(() => claimGamePoints(token, gameData.gameId, randPoints), 'claimGamePoints');
                                
                                if (letsPlay === 'OK') {
                                    const balance = await retry(() => getBalance(token), 'getBalance');
                                    console.log(` [>] Play game success! Your balance now: ${balance.availableBalance} BLUM (+${randPoints})`);
                                }
                            } catch (error) {
                                console.error(' [!] An error occurred:', error);
                                break;
                            }
                            counter--;
                        }
                    } else {
                        await askQuestion(`\n [!] You can't play, you have ${balance.playPasses} chance(s). [ENTER]`);
                        continue;
                    }
                } else if (choice == '5') {
                    console.clear();
                    header(parseInt(choice));

                    const tasksData = await retry(() => getTasks(token), 'getTasks');

                    tasksData.forEach((category) => {
                        category.tasks.forEach(async (task) => {
                            if (task.status === 'FINISHED') {
                                console.log(`⏭️  Task "${task.title}" is already completed.`);
                            } else if (task.status === 'NOT_STARTED') {
                                console.log(` [#] Task "${task.title}" is not started yet. Starting now...`);

                                const startedTask = await retry(() => startTask(token, task.id, task.title), 'startTask');

                                if (startedTask) {
                                    console.log(` [#] Task "${startedTask.title}" has been started!`);

                                    try {
                                        const claimedTask = await retry(() => claimTaskReward(token, task.id), 'claimTaskReward');
                                        console.log(` [#] Task "${claimedTask.title}" has been claimed!`);
                                        console.log(` [#] Reward: ${claimedTask.reward}`);
                                    } catch (error) {
                                        console.log(` [#] Unable to claim task "${task.title}", please try to claim it manually.`);
                                    }
                                }
                            } else if (
                                task.status === 'STARTED' ||
                                task.status === 'READY_FOR_CLAIM'
                            ) {
                                try {
                                    const claimedTask = await retry(() => claimTaskReward(token, task.id), 'claimTaskReward');

                                    console.log(` [>] Task "${claimedTask.title}" has been claimed!`);
                                    console.log(` [>] Reward: ${claimedTask.reward}`);
                                } catch (error) {
                                    console.log(` [!] Unable to claim task "${task.title}".`);
                                }
                            }
                            
                            const delay = Math.floor(Math.random() * (MAX_DELAY_PER_TASK - MIN_DELAY_PER_TASK + 1)) + MIN_DELAY_PER_TASK;
                            await sleep(delay);
                        });
                    });

                    await askQuestion('\n [!] Back to main menu [ENTER]');
                } else if (choice == '6') {
                    console.clear();
                    header(parseInt(choice));

                    const claimResponse = await retry(() => claimFarmReward(token), 'claimFarmReward');

                    if (claimResponse) {
                        console.log(' [#] Farm reward claimed successfully!');
                    }

                    const runAgain = await askQuestion(' [?] Run farm reward claim every 9 hours? (y/n): ');

                    if (runAgain.toLowerCase() === 'yes' || runAgain.toLowerCase() === 'ye' || runAgain.toLowerCase() === 'y') {
                        cronJobRunning = true;
                        console.log(' [-] Setting up daily reward cron job...');
                        setupFarmReward(token).then(() => {
                            console.log(' [-] Daily reward cron job has been completed.');
                            cronJobRunning = false;
                        }).catch(error => {
                            console.error(' [!] Error setting up daily reward cron job:', error);
                            cronJobRunning = false;
                        });

                        console.log(' [-] Cron job is set, exiting the main loop.');
                        break;
                    }
                } else if (choice == '7') {
                    console.clear();
                    header(parseInt(choice));

                    try {
                        const farmingSession = await retry(() => startFarmingSession(token), 'startFarmingSession');
                
                        console.log(` [#] Farming session started!`);
                        console.log(` [#] Start time: ${formatDate(farmingSession.startTime)}`);
                        console.log(` [#] End time: ${formatDate(farmingSession.endTime)}`);
                
                        cronJobRunning = true;
                        console.log(' [-] Setting up farming session cron job...');

                        await Promise.all([
                            setupCronJob(token),
                            setupBalanceCheck(token)
                        ]);
                
                        console.log(' [-] All cron jobs have been completed.');
                    } catch (error) {
                        console.error(' [!] Error setting up cron jobs:', error);
                    }

                    break;
                }
            }
        } else {
            console.log(' [*] A cron job is currently running. Please wait...');
            await sleep(1000);
        }
    }

    if (cronJobRunning) {
        console.log(' [*] Cron job is now running. The program will exit to focus on the cron job.');
        rl.close();
        await new Promise(resolve => setInterval(resolve, 1000 * 60 * 60 * 24));
    }
})();