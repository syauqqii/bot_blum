const axios = require('axios');

async function getToken(id) {
    const { data } = await axios({
        url: 'https://user-domain.blum.codes/api/v1/auth/provider/PROVIDER_TELEGRAM_MINI_APP',
        method: 'POST',
        data: {
            query: id,
            referralToken: process.env.REFERRAL_TOKEN || '',
        },
    });
    
    return `Bearer ${data.token.access}`;
}

module.exports = getToken;
