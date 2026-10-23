const getOrganisationId = (req, res) => {
    if (!req.organisationId) {
        res.status(403).json({
            message: "Organisation context required",
        });

        return null;
    }

    return req.organisationId;
};

module.exports = { getOrganisationId };
