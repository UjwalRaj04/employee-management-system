const applyAnnualPayIncrease = require("../services/annualPayService");
const { getOrganisationId } = require("../utils/organisationContext");

const applyPayIncrease = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const result = await applyAnnualPayIncrease(organisationId);

        res.status(200).json(result);
    } catch (error) {
        console.error("Apply annual pay error:", error);

        const knownErrors = [
            "was not found",
            "has already been applied",
            "Organisation context",
        ];

        const isClientError = knownErrors.some((text) =>
            error.message.includes(text)
        );

        res.status(isClientError ? 400 : 500).json({
            message: error.message || "Server Error",
        });
    }
};

module.exports = { applyPayIncrease };
