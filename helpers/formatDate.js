const moment = require('moment');

function formatDate(date) {
    return moment(date).format('MMMM Do YYYY, h:mm:ss A');
}

module.exports = {
    formatDate,
};