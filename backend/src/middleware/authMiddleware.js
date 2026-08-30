const jwt = require("jsonwebtoken")
const User = require("../models/User")
const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return res.status(401).json({
                message: "No token Provided"
            })
        }
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired Token"
        });
    }
};

const authorize = (...allowredRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "User not Authenticated"
            });
        }
        const hashPermission = allowredRoles.includes(req.user.role);

        if (!hashPermission) {
            return res.status(403).json({
                message: "Access denied. You do not have permission.",
            });
        }
        next();
    };
};
module.exports = { protect, authorize, }