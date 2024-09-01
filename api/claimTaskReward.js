const axios = require('axios');

async function claimTaskReward(token, taskId) {
    const { data } = await axios({
        url: `https://game-domain.blum.codes/api/v1/tasks/${taskId}/claim`,
        method: 'POST',
        headers: { Authorization: token },
        data: null,
    });

    return data;
}

module.exports = claimTaskReward;