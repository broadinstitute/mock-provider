const { getObject } = require('./googleObjects');

function exchangeHandler(req, res) {
    if (req.method === "POST") {
        const grantType = req.body.grant_type;
        if (grantType === "authorization_code" || grantType === "refresh_token") {
            // This is a mock service, so we don't care at all about auth codes or refresh tokens
            const tokenObjectUrl = "https://storage.googleapis.com/wb-dev-mock-provider/token-object.json";
            getObject(tokenObjectUrl).then((tokenObject) => {
                res.status(200).send(tokenObject);
            }).catch((err) => {
                res.status(500).send({error: err});
            })
        } else {
            res.status(400).send({error: "Invalid grant type.  Must be one of [authorization_code, refresh_token]"});
        }
    } else {
        res.status(405).send({error: "Request method " + req.method + " is not permitted.  Method must be POST"});
    }
}

exports.exchangeHandler = exchangeHandler;