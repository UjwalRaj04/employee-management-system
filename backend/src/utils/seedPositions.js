const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");
const Organisation = require("../models/Organisation");
const Position = require("../models/Position");
const defaultPositions = require("./defaultPositions");

const seedPositions = async () => {
    try {
        await connectDB();

        const organisations = process.env.ORGANISATION_ID
            ? await Organisation.find({ _id: process.env.ORGANISATION_ID })
            : await Organisation.find({});

        if (organisations.length === 0) {
            throw new Error(
                "No organisations found. Register an organisation first or set ORGANISATION_ID."
            );
        }

        for (const organisation of organisations) {
            for (const position of defaultPositions) {
                const saved = await Position.findOneAndUpdate(
                    {
                        organisationId: organisation._id,
                        name: position.name,
                    },
                    {
                        $set: {
                            ...position,
                            organisationId: organisation._id,
                        },
                    },
                    { upsert: true, returnDocument: "after" }
                );

                console.log(
                    organisation.slug,
                    saved.name,
                    saved.pay,
                    saved.payPeriod
                );
            }
        }

        await mongoose.connection.close();
        console.log("Position seed complete");
    } catch (error) {
        console.error("Position seed error:", error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

seedPositions();
