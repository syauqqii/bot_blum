const axios = require('axios');

async function claimGamePoints(token, gameId, points) {
    const { data } = await axios({
        url: `https://game-domain.blum.codes/api/v1/game/claim`,
        method: 'POST',
        headers: { Authorization: token },
        data: {
            gameId,
            points,
        },
    });

    return data;
}

module.exports = claimGamePoints;