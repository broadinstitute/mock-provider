const request = require('superagent');

function getKey() {
    return request.get("https://storage.googleapis.com/wb-dev-mock-provider/fake-sa-key.json")
        .then((response) => {
            return response.text;
        })
        .catch((err) => {
            console.error(new Error(`Failed while trying to retrieve token-object.json from Google Bucket.\n${err.message}\n${err.response}`))
        });
}

async function retrieveKeyHandler(req, res) {
    const key = await getKey();
    res.status(200).send(key);
}

exports.retrieveKeyHandler = retrieveKeyHandler;