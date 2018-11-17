function authorizationHandler(req, res) {
    const redirectUri = req.query.redirect_uri
    res.status(200).send('Redirecting you to: ' + redirectUri);
}

exports.authorizationHandler = authorizationHandler;