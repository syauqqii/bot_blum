const axios = require('axios');

async function getTribe(token) {
    try {
        const response = await axios({
            url: 'https://tribe-domain.blum.codes/api/v1/tribe/my',
            method: 'GET',
            headers: { Authorization: token },
        });

        return response.data;
    } catch (error) {
        if (error.response.data.message === 'NOT_FOUND') {
            return;
        } else {
            console.log(error.response.data.message);
        }
    }
}

module.exports = getTribe;
