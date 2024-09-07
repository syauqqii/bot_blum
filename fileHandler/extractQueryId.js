const fs = require('fs');

function writeJSONFile(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

const decodeURL = (url) => {
    try {
        const urlObj = new URL(url);
        const hashParams = new URLSearchParams(urlObj.hash.substring(1));
        const tgWebAppData = hashParams.get('tgWebAppData');

        if (!tgWebAppData) {
            console.log("\n   ! Cannot find 'tgWebAppData' parameter.");
            return null;
        }

        const decodedData = decodeURIComponent(tgWebAppData);
        return decodedData;
    } catch (error) {
        console.error("\n   ! Invalid URL.");
        return null;
    }
};

const parseQueryData = (decodedData) => {
    try {
        const params = new URLSearchParams(decodedData);

        const queryId = params.toString();
        const user = params.get('user');

        if (!queryId || !user) {
            console.error("\n   ! Could not find 'query_id' or 'user' in decoded data.");
            return null;
        }

        const decodedUser = decodeURIComponent(user);
        const userObj = JSON.parse(decodedUser);

        return {
            query_id: queryId,
            username: userObj.username,
        };

    } catch (error) {
        console.error("\n   ! Error parsing query data: " + error.message);
        return null;
    }
};

const saveQueryId = (file, queryData) => {
    let data = [];
    try {
        data = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
        console.error("\n   ! Error reading JSON file. Creating a new file.");
    }

    if (!Array.isArray(data)) {
        data = [];
    }

    const existingIndex = data.findIndex(entry => entry.query_id === queryData.query_id);
    
    if (existingIndex === -1) {
        data.push(queryData);
        writeJSONFile(file, data);
    } else {
        console.log("\n   ! Query ID already exists in the file.");
    }
};

const extractQueryIds = (file, url) => {
    try {
        const decodedData = decodeURL(url);
        if (!decodedData) {
            throw new Error("\n   ! Failed to decode URL data.");
        }

        const queryData = parseQueryData(decodedData);
        if (!queryData) {
            throw new Error("\n   ! Failed to parse query data.");
        }

        saveQueryId(file, queryData);
        return true;
    } catch (error) {
        console.error(`\n   ! Error extracting query IDs: ${error.message}`);
        return false;
    }
};

module.exports = {
    extractQueryIds
};