const jwt = require("jsonwebtoken")
const User = require("../models/User");
const Organisation = require("../models/Organisation");
const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({
            message: "No token provided",
        });
    }
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "No token provided",
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }

    try {
        const user = await User.findById(decoded.id).select(
            "_id name email role organisationId"
        );

        if (!user) {
            return res.status(401).json({
                message: "User account not found",
            });
        }
        req.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            organisationId: user.organisationId ?
                user.organisationId.toString() : null,
        };
        return next();
    }
    catch(error){
        console.error("Authentication middleware error:",error);

        return res.status(500).json({
            message:"Unable to authenticate user",
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