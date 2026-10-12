const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Organisation = require("../models/Organisation");
const User = require("../models/User");

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESERVED_SLUGS = [
  "admin",
  "api",
  "app",
  "www",
  "login",
  "register",
  "support",
];

// Lets us throw an error with an HTTP status from anywhere in the flow
class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const isFilledString = (value) =>
  typeof value === "string" && value.trim().length > 0;

// ============================================
// REGISTER A NEW ORGANISATION
// ============================================

const registerOrganisation = async (req, res) => {
  const { organisationName, slug, adminName, adminEmail, password } =
    req.body ?? {};

  // Step 1: Every field must be a non-empty string.
  // Checking the type first stops "slug": 123 from crashing on .trim().
  if (
    !isFilledString(organisationName) ||
    !isFilledString(slug) ||
    !isFilledString(adminName) ||
    !isFilledString(adminEmail) ||
    typeof password !== "string" ||
    password.length === 0
  ) {
    return res.status(400).json({
      message:
        "Organisation name, slug, admin name, admin email and password are required",
    });
  }

  // Step 2: Normalise input
  const name = organisationName.trim();
  const normalisedSlug = slug.trim().toLowerCase();
  const normalisedAdminName = adminName.trim();
  const normalisedEmail = adminEmail.trim().toLowerCase();

  // Step 3: Validate formats
  if (
    normalisedSlug.length < 3 ||
    normalisedSlug.length > 40 ||
    !SLUG_PATTERN.test(normalisedSlug)
  ) {
    return res.status(400).json({
      message:
        "Slug must be 3-40 characters using lowercase letters, numbers and single hyphens",
    });
  }

  if (RESERVED_SLUGS.includes(normalisedSlug)) {
    return res.status(400).json({ message: "This slug is reserved" });
  }

  if (!EMAIL_PATTERN.test(normalisedEmail)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  // bcrypt only uses the first 72 bytes, so cap the length
  if (password.length < 8 || password.length > 72) {
    return res.status(400).json({
      message: "Password must be between 8 and 72 characters",
    });
  }

  // The first user of an organisation is always its admin.
  // The request cannot choose the role or the organisationId.
  let session;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    session = await mongoose.startSession();

    let createdOrganisation;
    let createdAdmin;

    // Create the organisation and its first admin in one transaction,
    // so you can never end up with one but not the other
    await session.withTransaction(async () => {
      const existingOrganisation = await Organisation.findOne({
        slug: normalisedSlug,
      }).session(session);

      if (existingOrganisation) {
        throw new HttpError(409, "Organisation slug already exists");
      }

      const existingUser = await User.findOne({
        email: normalisedEmail,
      }).session(session);

      if (existingUser) {
        throw new HttpError(409, "This email is already registered");
      }

      const organisations = await Organisation.create(
        [{ name, slug: normalisedSlug }],
        { session }
      );

      createdOrganisation = organisations[0];

      const users = await User.create(
        [
          {
            name: normalisedAdminName,
            email: normalisedEmail,
            password: hashedPassword,
            role: "admin",
            organisationId: createdOrganisation._id,
          },
        ],
        { session }
      );

      createdAdmin = users[0];
    });

    return res.status(201).json({
      message: "Organisation registered successfully",

      organisation: {
        id: createdOrganisation._id,
        name: createdOrganisation.name,
        slug: createdOrganisation.slug,
        status: createdOrganisation.status,
      },

      user: {
        id: createdAdmin._id,
        name: createdAdmin.name,
        email: createdAdmin.email,
        role: createdAdmin.role,
        organisationId: createdAdmin.organisationId,
      },
    });
  } catch (error) {
    console.error("Register organisation error:", error);

    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    // Duplicate-key protection, including race conditions
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "An organisation with this slug or a user with this email already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    // Code 20 means transactions aren't available on this MongoDB server
    if (error.code === 20) {
      console.error(
        "Transactions need a replica set. Use MongoDB Atlas or a local replica set."
      );
    }

    return res.status(500).json({
      message: "Unable to register organisation",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

module.exports = {
  registerOrganisation,
};