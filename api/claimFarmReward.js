const axios = require('axios');

async function claimFarmReward(token) {
    try {
        const { data } = await axios({
            url: 'https://game-domain.blum.codes/api/v1/farming/claim',
            method: 'POST',
            headers: { Authorization: token },
            data: null,
        });

        return data;
    } catch (error) {
        if (error.response.data.message === `It's too early to claim`) {
            console.error('\n [!] Claim failed! It\'s too early to claim.');
        } else {
            console.error(`\n [!] Error occured from farm claim: ${error}`);
        }
    }
}

module.exports = claimFarmReward;