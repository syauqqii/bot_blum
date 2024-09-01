const axios = require('axios');

async function startFarmingSession(token) {
    const { data } = await axios({
        url: 'https://game-domain.blum.codes/api/v1/farming/start',
        method: 'POST',
        headers: { Authorization: token },
        data: null,
    });

    return data;
}

module.exports = startFarmingSession;