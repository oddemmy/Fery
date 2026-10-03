const jwt = require("jsonwebtoken");
require("dotenv").config();

const optionalAuth = (req, res, next) => {
    try {
        const token =req.headers.authorization?.split(" ")[1];
        if (!token) {
            next();
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        next();
    }
}

module.exports = optionalAuth;