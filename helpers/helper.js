const retry = async (fn, fName, maxRetries=5, delay=5) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;

            console.log(`   ! Retrying "${fName}" (${i + 1}/${maxRetries})`);
            await sleep(delay * 1000); 
        }
    }
};

const sleep = (ms) => new Promise(
    (resolve) => setTimeout(resolve, ms)
);

const spinner = async (duration, i, playPasses) => {
    const spinnerChars = ['|', '/', '-', '\\'];
    let currentIndex = 0;

    const spin = setInterval(() => {
        process.stdout.write(`\r   # Playing game, wait for 1 minute [${spinnerChars[currentIndex]}] (${i}/${playPasses})`);
        currentIndex = (currentIndex + 1) % spinnerChars.length;
    }, 100);

    await sleep(duration);
    clearInterval(spin);
};

module.exports = {
    retry, sleep, spinner
};