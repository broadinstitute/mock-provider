const URL = require('url').URL;

function addStateToUri(state, origRedirectUrl) {
    const myUrl = new URL(origRedirectUrl);
    if (state) {
        myUrl.searchParams.append("state", state);
    }
    return myUrl.toString();
}

function authorizationHandler(req, res) {
    const origRedirectUri = req.query.redirect_uri;
    if (origRedirectUri) {
        const redirectUri = addStateToUri(req.query.state, origRedirectUri);
        res.redirect(303, redirectUri);
    } else {
        res.status(400).send("Query params must include a redirect_uri")
    }
}

exports.authorizationHandler = authorizationHandler;