const { authorizationHandler } = require('./authorize');
const { exchangeHandler } = require('./exchange');

function handleGET (req, res) {
    // Do something with the GET request
    res.status(200).send('Hello World!');
}

function handlePUT (req, res) {
    // Do something with the PUT request
    res.status(403).send('Forbidden!');
}

/**
 * Responds to a GET request with "Hello World!". Forbids a PUT request.
 *
 * @example
 * gcloud alpha functions call helloHttp
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.helloHttp = (req, res) => {
    switch (req.method) {
        case 'GET':
            handleGET(req, res);
            break;
        case 'PUT':
            handlePUT(req, res);
            break;
        default:
            res.status(405).send({ error: 'Something blew up!' });
            break;
    }
};

exports.authorize = (req, res) => {
    authorizationHandler(req, res)
};

// Sticking with some convention and calling this endpoint "token" externally, but internally "exchange" because it's
// more descriptive
exports.token = (req, res) => {
    exchangeHandler(req, res)
};