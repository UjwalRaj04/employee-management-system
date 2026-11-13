const crypto = require("crypto");

// Generate a secure random invitation token.
const generateInvitationToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

// Hash the invitation token before storing it in MongoDB.
const hashInvitationToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

// Set invitation expiry to 24 hours.
const getInvitationExpiry = () => {
    const expiry = new Date();

    expiry.setHours(expiry.getHours() + 24);

    return expiry;
};

module.exports = {
    generateInvitationToken,
    hashInvitationToken,
    getInvitationExpiry,
};