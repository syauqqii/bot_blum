function header(options = 0) {
    const headers = {
        0: { title: 'Automatic Bot Blum', separator: '--------------------' },
        1: { title: 'Add Account', separator: '-------------' },
        2: { title: 'Claim Daily Reward', separator: '--------------------' },
        3: { title: 'Auto Play Tickets', separator: '-------------------' },
        4: { title: 'Auto Complete Tasks', separator: '---------------------' },
        5: { title: 'Auto Farming Reward', separator: '---------------------' },
        6: { title: 'Start Farming Session', separator: '-----------------------' }
    };

    const { title, separator } = headers[options] || headers[0];
    console.log(`\n $ ${title}`);
    console.log(` ${separator}`);
}

module.exports = header;