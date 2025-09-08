const helmet = require("helmet");

module.exports = () => {
    return helmet({
        contentSecurityPolicy: false,
    });
};