const jwt = require("jsonwebtoken")
const User = require("../models/User")
const protect=async(req,res,next)=>{
    const authHeader=req.headers.authorization;

    if(!authHeader|| !authHeader.startsWith("Bearer")){
        return res.status(401).json({
            message:"No token provided",
        });
    }
    const token=authHeader.split(" ")[1];

    if(!token){
        return res.status(401).json({
            message:"No token provided",
        });
    }

    let decoded;

    try{
        
    }
}

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