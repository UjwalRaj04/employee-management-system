const express = require("express");

const {
    registerOrganisation,
} = require("../controllers/organisationController");

const {
    protect,
} = require("../middleware/authMiddleware");

const {
    requireOrganisationContext,
} = require("../middleware/tenantContextMiddleware");

const router = express.Router();

// Public endpoint: Register a new organisation and its first admin.
router.post("/register", registerOrganisation);

// Protected endpoint: Get the authenticated user's organisation.
router.get(
    "/me",
    protect,
    requireOrganisationContext,
    (req, res) => {
        return res.status(200).json({
            message: "Organisation context verified successfully",
            organisation: req.organisation,
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                organisationId: req.user.organisationId,
            },
        });
    }
);

module.exports = router;