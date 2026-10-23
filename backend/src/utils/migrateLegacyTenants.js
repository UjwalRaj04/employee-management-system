require("dotenv").config();

const mongoose = require("mongoose");

const Organisation = require("../models/Organisation");
const User = require("../models/User");
const Employee = require("../models/Employee");
const Position = require("../models/Position");
const Branch = require("../models/Branch");
const BusinessYear = require("../models/businessYear");
const PayrollRun = require("../models/PayrollRun");
const Payslip = require("../models/Payslip");
const Shift = require("../models/Shift");

const missingOrganisationQuery = {
    $or: [{ organisationId: { $exists: false } }, { organisationId: null }],
};

const dropIndexIfExists = async (model, indexName) => {
    try {
        await model.collection.dropIndex(indexName);
        console.log(`Dropped legacy index ${model.collection.name}.${indexName}`);
    } catch (error) {
        if (error.code !== 27 && error.codeName !== "IndexNotFound") {
            throw error;
        }
    }
};

const resolveTargetOrganisation = async () => {
    if (process.env.TARGET_ORGANISATION_ID) {
        const organisation = await Organisation.findById(
            process.env.TARGET_ORGANISATION_ID
        );

        if (!organisation) {
            throw new Error("TARGET_ORGANISATION_ID does not match an organisation");
        }

        return organisation;
    }

    const organisations = await Organisation.find({});

    if (organisations.length === 1) {
        return organisations[0];
    }

    if (organisations.length === 0) {
        const [created] = await Organisation.create([
            {
                name: "Legacy Organisation",
                slug: "legacy-organisation",
            },
        ]);

        console.log("Created legacy organisation:", created._id.toString());
        return created;
    }

    throw new Error(
        "Multiple organisations exist. Set TARGET_ORGANISATION_ID before migrating leftover records."
    );
};

const assignOrganisation = async (model, organisationId, label) => {
    const result = await model.updateMany(missingOrganisationQuery, {
        $set: { organisationId },
    });

    console.log(
        `${label}: matched ${result.matchedCount}, updated ${result.modifiedCount}`
    );

    return result;
};

const migrateNamedDocuments = async (model, organisationId, label) => {
    const unassigned = await model.find(missingOrganisationQuery);

    let updated = 0;
    let skipped = 0;

    for (const document of unassigned) {
        const clash = await model.findOne({
            organisationId,
            name: document.name,
            _id: { $ne: document._id },
        });

        if (clash) {
            console.log(
                `${label}: skipped "${document.name}" because the target organisation already has it`
            );
            skipped += 1;
            continue;
        }

        document.organisationId = organisationId;
        await document.save();
        updated += 1;
    }

    console.log(`${label}: updated ${updated}, skipped ${skipped}`);
};

const migrateEmployees = async (organisationId) => {
    const unassigned = await Employee.find(missingOrganisationQuery).select(
        "_id name email"
    );

    for (const employee of unassigned) {
        const clash = await Employee.findOne({
            organisationId,
            email: employee.email,
            _id: { $ne: employee._id },
        });

        if (clash) {
            throw new Error(
                `Cannot migrate employee ${employee.email}: another employee in the target organisation already uses this email`
            );
        }

        employee.organisationId = organisationId;
        await employee.save();
    }

    console.log(`Employees: migrated ${unassigned.length}`);
};

const migrateLegacyTenants = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    try {
        await dropIndexIfExists(Position, "name_1");
        await dropIndexIfExists(Branch, "name_1");
        await dropIndexIfExists(BusinessYear, "year_1");
        await dropIndexIfExists(PayrollRun, "period_1");
        await dropIndexIfExists(Payslip, "employee_1_period_1");

        const organisation = await resolveTargetOrganisation();
        const organisationId = organisation._id;

        console.log(
            "Migrating leftover records into:",
            organisation.name,
            organisation._id.toString()
        );

        await migrateEmployees(organisationId);
        await User.updateMany(
            {
                ...missingOrganisationQuery,
                role: { $ne: "platformAdmin" },
            },
            { $set: { organisationId } }
        ).then((result) => {
            console.log(
                `Users: matched ${result.matchedCount}, updated ${result.modifiedCount}`
            );
        });

        await migrateNamedDocuments(Position, organisationId, "Positions");
        await migrateNamedDocuments(Branch, organisationId, "Branches");
        await assignOrganisation(BusinessYear, organisationId, "Business years");
        await assignOrganisation(PayrollRun, organisationId, "Payroll runs");
        await assignOrganisation(Payslip, organisationId, "Payslips");
        await assignOrganisation(Shift, organisationId, "Shifts");

        await Promise.all([
            Employee.syncIndexes(),
            User.syncIndexes(),
            Position.syncIndexes(),
            Branch.syncIndexes(),
            BusinessYear.syncIndexes(),
            PayrollRun.syncIndexes(),
            Payslip.syncIndexes(),
            Shift.syncIndexes(),
            Organisation.syncIndexes(),
        ]);

        const leftoverEmployees = await Employee.countDocuments(
            missingOrganisationQuery
        );

        if (leftoverEmployees > 0) {
            throw new Error(
                `Migration incomplete: ${leftoverEmployees} employee(s) still have no organisationId`
            );
        }

        console.log("SUCCESS: Legacy tenant migration complete.");
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB connection closed.");
    }
};

migrateLegacyTenants().catch((error) => {
    console.error("Legacy tenant migration failed:", error.message);
    process.exit(1);
});
