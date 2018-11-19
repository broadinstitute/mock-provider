const request = require('superagent');

function getObject(objectUrl) {
    return request.get(objectUrl)
        .then((response) => {
            return response.text;
        })
        .catch((err) => {
            console.error(new Error(`Failed while trying to GET "${objectUrl}"\n${err}`));
            throw err;
        });
}

exports.getObject = getObject;