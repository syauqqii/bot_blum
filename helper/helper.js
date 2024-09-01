const readline = require('readline');

const sleep = (ms) => new Promise(
    (resolve) => setTimeout(resolve, ms)
);

const retry = async (fn, fName, maxRetries=5, delay=5) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;

            console.log(` [!] Retrying "${fName}" (${i + 1}/${maxRetries})`);
            await sleep(delay * 1000); 
        }
    }
};

module.exports = {
    retry, sleep
};