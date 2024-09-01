const axios = require('axios');

async function startTask(token, taskId, title) {
    try {
        const { data } = await axios({
            url: `https://game-domain.blum.codes/api/v1/tasks/${taskId}/start`,
            method: 'POST',
            headers: { Authorization: token },
            data: null,
        });

        return data;
    } catch (error) {
        if (
            error.response && error.response.data &&
            error.response.data.message === 'Task type does not support start'
        ) {
            console.error(`\n [!] Start task "${title}" failed, the task is not started yet.`);
        } else {
            console.log(error.response.data.message);
        }
    }
}

module.exports = startTask;