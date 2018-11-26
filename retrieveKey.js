const { getObject } = require('./googleObjects');

function returnSharedServiceAccountKey(res) {
    const serviceAcctKeyUrl = "https://storage.googleapis.com/wb-dev-mock-provider/shared_sa_key.json";
    getObject(serviceAcctKeyUrl).then((key) => {
        res.status(200).send(key);
    }).catch((err) => {
        res.status(500).send({error: err});
    });
}

function returnOpenIdConfig(res) {
    const openIdConfigUrl = "https://storage.googleapis.com/wb-dev-mock-provider/well-known.json";
    getObject(openIdConfigUrl).then((conf) => {
        res.status(200).send(conf);
    }).catch((err) => {
        res.status(500).send({error: err});
    });
}

function retrieveKeyHandler(req, res) {
    if (req.method === "POST") {
        returnSharedServiceAccountKey(res);
    } else if (req.method === "GET" && req.path === "/.well-known/openid-configuration" ) {
        returnOpenIdConfig(res);
    } else {
        res.status(400).send({error: "Unrecognized request.  POST to this url to get the Service Account Key.  Or issue a GET request with the path '/.well-known/openid-configuration'"});
    }
}

exports.retrieveKeyHandler = retrieveKeyHandler;