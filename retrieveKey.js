const { getObject } = require('./googleObjects');

function retrieveKeyHandler(req, res) {
    if (req.method === "POST") {
        const serviceAcctKeyUrl = "https://storage.googleapis.com/wb-dev-mock-provider/fake-sa-key.json";
        getObject(serviceAcctKeyUrl).then((key) => {
            res.status(200).send(key);
        }).catch((err) => {
            res.status(500).send({error: err});
        });
    } else {
        res.status(405).send({error: "Request method " + req.method + " is not permitted.  Method must be POST"});
    }
}

exports.retrieveKeyHandler = retrieveKeyHandler;