const express = require("express");

const {
    registerOrganisation,
} = require("../controllers/organisationController");

const router = express.Router();


// ============================================
// REGISTER A NEW ORGANISATION
// POST /api/organisations/register
// Public route: no login required
// ============================================

router.post(
    "/register",
    registerOrganisation
);


module.exports = router;