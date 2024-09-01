const axios = require('axios');

async function getTasks(token) {
    const { data } = await axios({
        url: 'https://game-domain.blum.codes/api/v1/tasks',
        method: 'GET',
        headers: { Authorization: token },
    });

    return data;
}

module.exports = getTasks;