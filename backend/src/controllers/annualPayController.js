const applyAnnualPayIncrease = require("../services/annualPayService");

const applyPayIncrease = async (req, res) => {
    try {
        const result = await applyAnnualPayIncrease();

        res.status(200).json(result);
    } catch (error) {
        console.error("Apply annual pay error:", error);

        const knownErrors = [
            "was not found",
            "has already been applied",
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
