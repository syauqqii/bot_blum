function header(options=0) {
    console.log('\n      ____  _     _    _ __  __ ');
    console.log('     |  _ \\| |   | |  | |  \\/  |');
    console.log('     | |_) | |   | |  | | \\  / |');
    console.log('     |  _ <| |   | |  | | |\\/| |');
    console.log('     | |_) | |___| |__| | |  | |');
    console.log('     |____/|______\\____/|_|  |_|\n');

    console.log(' ------------------------------------');
    if (options === 0) {
        console.log(' [>]         Automatic Bot        [<]');
    } else if (options === 1) {
        console.log(' [>]          Add Account         [<]');
    } else if (options === 2) {
        console.log(' [>]        Get List Account      [<]');
    } else if (options === 3) {
        console.log(' [>]       Claim Daily Reward     [<]');
    } else if (options === 4) {
        console.log(' [>]        Auto Play Tickets     [<]');
    } else if (options === 5) {
        console.log(' [>]       Auto Complete Tasks    [<]');
    } else if (options === 6) {
        console.log(' [>]      Claim Farming Reward    [<]');
    } else if (options === 7) {
        console.log(' [>]     Start Farming Session    [<]');
    } else if (options === 8) {
        console.log(' [>]      Another Option Here     [<]');
    }
    console.log(' ------------------------------------');
}

module.exports = header;