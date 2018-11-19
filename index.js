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

// This function must be reachable at the route: "/user/credentials/google" via HTTP POST.
// GCF just grabs the first part of the path when matching the function, so we don't need to do anything special to
// match the full, required path.  FYI, if you want the full path from the code: `req.path`
exports.user = (req, res) => {
    retrieveKeyHandler(req, res);
};