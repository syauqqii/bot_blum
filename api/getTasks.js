const axios = require('axios');

async function getTasks(token) {
    const { data } = await axios({
        url: 'https://earn-domain.blum.codes/api/v1/tasks',
        method: 'GET',
        headers: { Authorization: token },
    });

    return data[0].tasks;
}

module.exports = getTasks;
