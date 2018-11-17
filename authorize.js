const URL = require('url').URL;
const uuid = require('uuid');

function buildRedirectUrl(origUrl, origParams) {
    const redirectUrl = new URL(origUrl);

    const randomCode = uuid.v4();
    redirectUrl.searchParams.append("code", randomCode);

    const stateParam = origParams.state;
    if (stateParam) {
        redirectUrl.searchParams.append("state", stateParam);
    }

    return redirectUrl;
}

function authorizationHandler(req, res) {
    const origRedirectUri = req.query.redirect_uri;
    if (origRedirectUri) {
        const redirectUrl = buildRedirectUrl(origRedirectUri, req.query);
        res.redirect(303, redirectUrl.toString());
    } else {
        res.status(400).send("Query params must include a redirect_uri")
    }
}

exports.authorizationHandler = authorizationHandler;