const { getObject } = require('./googleObjects');

function retrieveKeyHandler(req, res) {
    if (req.method === "POST") {
        const serviceAcctKeyUrl = "https://storage.googleapis.com/wb-dev-mock-provider/shared_sa_key.json";
        getObject(serviceAcctKeyUrl).then((key) => {
            res.status(200).send(key);
        }).catch((err) => {
            res.status(500).send({error: err});
        });
    } else if (req.method === "GET" && req.path === "/.well-known/openid-configuration" ) {
        // TODO: we can actually have this get the well-known config from the bucket
        res.status(200).send(req.path + "\nThis URL is called by Bond to check the status of this Provider.  To get the well-known openid-config for this service, please go to: https://storage.googleapis.com/wb-dev-mock-provider/well-known.json");
    } else {
        res.status(400).send({error: "Unrecognized request.  POST to this url to get the Service Account Key.  Or issue a GET request with the path '/.well-known/openid-configuration'"});
    }
}

exports.retrieveKeyHandler = retrieveKeyHandler;