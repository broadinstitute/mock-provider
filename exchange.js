const request = require('superagent');

function getTokenObject() {
    return request.get("https://storage.googleapis.com/wb-dev-mock-provider/token-object.json")
        .then((response) => {
            return response.text;
        })
        .catch((err) => {
            console.error(new Error(`Failed while trying to retrieve token-object.json from Google Bucket.\n${err.message}\n${err.response}`))
        });
}

async function exchangeHandler(req, res) {
    if (req.method === "POST") {
        const grantType = req.body.grant_type;
        if (grantType === "authorization_code" || grantType === "refresh_token") {
            // This is a mock service, so we don't care at all about auth codes or refresh tokens
            const tokenObject = await getTokenObject();
            res.status(200).send(tokenObject);
        } else {
            res.status(400).send({error: "Invalid grant type.  Must be one of [authorization_code, refresh_token]"});
        }
    } else {
        res.status(405).send({error: "Request method " + req.method + " is not permitted.  Method must be POST"});
    }
}

exports.exchangeHandler = exchangeHandler;