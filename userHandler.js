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

function revokeRefreshToken(refreshToken, res) {
    // POSTing to this url with a refresh token provided in the "token" attribute in the body is the trigger to
    // revoke the refresh token
    res.status(204).send();
}

function handleTokenRequest(req, res) {
    if (req.method === "POST") {
        if (req.body.token) {
            revokeRefreshToken(req.body.token, res);
        } else if (Object.keys(req.body).length === 0) {
            returnSharedServiceAccountKey(res);
        } else {
            res.status(400).send({error: "The body of your request must be empty or provide a token entry"});
        }
    } else {
        invalidMethodResponse(req, res, ["POST"])
    }
}

function handleGoogleCredentials(req, res) {
    if (req.method === "DELETE") {
        res.status(204).send();
    } else if (req.method === "POST") {
        returnSharedServiceAccountKey(res);
    } else {
        invalidMethodResponse(req, res, ["POST", "DELETE"]);
    }
}

function invalidMethodResponse(req, res, validMethods) {
    res.status(405).send({error: `Invalid request method: ${req.method}.  Must be one of: [${validMethods}]`});
}

const googleCredentialsRegex = /\/credentials\/google(\/)?/;

function handleUser(req, res) {
    if (req.path === "/oauth2/token") {
        handleTokenRequest(req, res)
    } else if (req.path === "/.well-known/openid-configuration" && req.method === "GET") {
        returnOpenIdConfig(res);
    } else if (googleCredentialsRegex.test(req.path)) {
        handleGoogleCredentials(req, res);
    } else {
        res.status(400).send({error: "Unrecognized request.  POST to this url to get the Service Account Key.  Or issue a GET request with the path '/.well-known/openid-configuration'"});
    }
}

exports.userHandler = handleUser;