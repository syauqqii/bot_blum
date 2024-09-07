const axios = require('axios');

async function claimDailyReward(token) {
    try {
        const { data } = await axios({
            url: 'https://game-domain.blum.codes/api/v1/daily-reward?offset=-420',
            method: 'POST',
            headers: { Authorization: token },
            data: null,
        });

        return data;
    } catch (error) {
        if (error.response.data.message === 'same day') {
            console.error('\n   ! Failed, you already claim this day.');
        } else {
            console.error(`\n   ! Error occured from daily claim: ${error}`);
        }
    }
}

module.exports = claimDailyReward;