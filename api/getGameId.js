const axios = require('axios');

async function getGameId(token) {
    const { data } = await axios({
        url: 'https://game-domain.blum.codes/api/v2/game/play',
        method: 'POST',
        headers: { Authorization: token },
        data: null,
    });

    return data;
}

module.exports = getGameId;
