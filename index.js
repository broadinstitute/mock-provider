const { authorizationHandler } = require('./authorize');
const { exchangeHandler } = require('./exchange');
const { retrieveKeyHandler } = require('./retrieveKey');

exports.authorize = (req, res) => {
    authorizationHandler(req, res);
};

// Sticking with some convention and calling this endpoint "token" externally, but internally "exchange" because it's
// more descriptive
exports.token = (req, res) => {
    exchangeHandler(req, res);
};

exports.key = (req, res) => {
    retrieveKeyHandler(req, res);
};