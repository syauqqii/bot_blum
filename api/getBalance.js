const axios = require('axios');

async function getBalance(token) {
    const response = await axios({
        url: 'https://game-domain.blum.codes/api/v1/user/balance',
        method: 'GET',
        headers: { Authorization: token },
    });

    return response.data;
}

module.exports = getBalance;