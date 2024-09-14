const axios = require('axios');

async function getUsername(token) {
    const response = await axios({
        url: 'https://user-domain.blum.codes/api/v1/user/me',
        method: 'GET',
        headers: { Authorization: token },
    });

    return response.data.username;
}

module.exports = getUsername;
