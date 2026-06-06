const env = require("./environment");
module.exports = (app) => {
    app.locals.assetPath = function (filePath) {
        return '/assets/' + filePath;
    }
}