const fs = require('fs');

function checkOrCreateJSONFile(file) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify([], null, 2), 'utf8');
    }
}

function readJSONFile(file) {
    checkOrCreateJSONFile(file);
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
}

function getAllQueryIds(file) {
    const data = readJSONFile(file);

    const uniqueQueryData = Array.from(new Map(data.map(item => [item.query_id, item])).values());

    if (uniqueQueryData.length === 0) {
        console.log('\n [#] Empty Data.');
    }

    return uniqueQueryData;
}

function getAllUsernames(file) {
    const data = readJSONFile(file);

    const usernames = data.map(item => item.username).filter(username => username !== undefined);

    if (usernames.length === 0) {
        console.log('\n [#] Empty Data.');
    }

    return usernames;
}

module.exports = {
    getAllQueryIds,
    getAllUsernames
};