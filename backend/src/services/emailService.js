const nodemailer = require("nodemailer");

// ==========================================
// 1. EMAIL CONFIGURATION
// ==========================================

const getEmailConfig = () => ({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,

    from:
        process.env.EMAIL_FROM ||
        process.env.EMAIL_USER ||
        "noreply@localhost",

    appUrl: (process.env.APP_URL || "http://localhost:5173").replace(/\/+$/, ""),
});

// ==========================================
// 2. CREATE EMAIL TRANSPORTER
// ==========================================

const createTransporter = () => {
    const { host, port, user, pass } = getEmailConfig();

    if (!host || !user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,

        auth: {
            user,
            pass,
        },
    });
};

// ==========================================
// 3. HTML ESCAPING
// ==========================================

const escapeHtml = (value = "") => {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };

        return entities[character];
    });
};

// ==========================================
// 4. VALIDATE EMAIL RECIPIENTS
// ==========================================

const validateRecipients = (to) => {
    if (!to) {
        throw new Error("Recipient email address is required.");
    }

    const recipients = Array.isArray(to) ? to : [to];

    const validRecipients = recipients
        .map((recipient) => String(recipient || "").trim())
        .filter(Boolean);

    if (validRecipients.length === 0) {
        throw new Error("At least one recipient is required.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const email of validRecipients) {
        if (!emailRegex.test(email)) {
            throw new Error(`Invalid recipient email address: ${email}`);
        }
    }

    return validRecipients;
};

// ==========================================
// 5. GENERIC EMAIL SENDER
// ==========================================

const sendEmail = async ({
    to,
    subject,
    text,
    html,
    from,
    attachments,
    cc,
    bcc,
} = {}) => {
    try {
        const recipients = validateRecipients(to);

        if (!subject || !String(subject).trim()) {
            throw new Error("Email subject is required.");
        }

        if (!text && !html) {
            throw new Error("Email must contain text or HTML content.");
        }

        const transporter = createTransporter();

        if (!transporter) {
            return {
                success: false,
                skipped: true,
                message: "Email service is not configured.",
            };
        }

        const mailOptions = {
            from: from || getEmailConfig().from,
            to: recipients.join(", "),
            subject: String(subject).trim(),
            text,
            html,
            attachments,
            cc,
            bcc,
        };

        const info = await transporter.sendMail(mailOptions);

        return {
            success: true,
            message: "Email accepted by the SMTP server.",
            messageId: info.messageId,
            accepted: info.accepted || [],
            rejected: info.rejected || [],
        };
    } catch (error) {
        console.error("Email sending failed:", error.message);

        return {
            success: false,
            message: "Unable to send email.",
            errorCode: error.code || "EMAIL_SEND_FAILED",
        };
    }
};

// ==========================================
// 6. WELCOME EMAIL
// ==========================================

const sendWelcomeEmail = async ({
    to,
    firstName = "there",
    organisationName = "ShiftMate",
    loginUrl,
}) => {
    const appUrl = getEmailConfig().appUrl;
    const destination = loginUrl || `${appUrl}/login`;

    const safeName = escapeHtml(firstName);
    const safeOrganisation = escapeHtml(organisationName);
    const safeDestination = escapeHtml(destination);

    return sendEmail({
        to,
        subject: `Welcome to ${organisationName}`,

        text: `
Hi ${firstName},

Welcome to ${organisationName} on ShiftMate.

Your employee account is ready.

Sign in here:
${destination}

Thanks,
The ${organisationName} Team
        `.trim(),

        html: `
            <div style="font-family:Arial,sans-serif;line-height:1.7;color:#333;max-width:600px;margin:auto;">
                <h2>Welcome to ShiftMate!</h2>

                <p>Hi ${safeName},</p>

                <p>
                    Welcome to <strong>${safeOrganisation}</strong>.
                    Your employee account is ready.
                </p>

                <a href="${safeDestination}"
                   style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
                    Sign In
                </a>

                <p>Thanks,<br/>The ${safeOrganisation} Team</p>
            </div>
        `,
    });
};

// ==========================================
// 7. EMPLOYEE INVITATION EMAIL
// ==========================================

const sendInvitationEmail = async ({
    to,
    invitedByName = "your manager",
    organisationName = "ShiftMate",
    inviteUrl,
    token,
    expiresInHours = 24,
}) => {
    const appUrl = getEmailConfig().appUrl;

    if (!inviteUrl && !token) {
        return {
            success: false,
            message: "An invitation URL or token is required.",
        };
    }

    const invitationLink =
        inviteUrl ||
        `${appUrl}/accept-invitation?token=${encodeURIComponent(token)}`;

    const safeInviter = escapeHtml(invitedByName);
    const safeOrganisation = escapeHtml(organisationName);
    const safeLink = escapeHtml(invitationLink);

    return sendEmail({
        to,

        subject: `Invitation to join ${organisationName} on ShiftMate`,

        text: `
Hello,

${invitedByName} has invited you to join ${organisationName} on ShiftMate.

Accept your invitation here:

${invitationLink}

This invitation expires in ${expiresInHours} hours.

If you weren't expecting this invitation, you can ignore this email.

Thanks,
The ${organisationName} Team
        `.trim(),

        html: `
            <div style="font-family:Arial,sans-serif;line-height:1.7;color:#333;max-width:600px;margin:auto;">
                <h2>You're invited to join ShiftMate!</h2>

                <p>Hello,</p>

                <p>
                    <strong>${safeInviter}</strong> has invited you
                    to join <strong>${safeOrganisation}</strong>.
                </p>

                <p>
                    Accept your invitation and create your employee account
                    using the button below.
                </p>

                <a href="${safeLink}"
                   style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
                    Accept Invitation
                </a>

                <p>
                    <strong>Important:</strong>
                    This invitation expires in ${expiresInHours} hours.
                </p>

                <p>If you weren't expecting this invitation, you can ignore this email.</p>

                <p>Thanks,<br/>The ${safeOrganisation} Team</p>
            </div>
        `,
    });
};

// ==========================================
// 8. PASSWORD RESET EMAIL
// ==========================================

const sendPasswordResetEmail = async ({
    to,
    resetUrl,
    token,
    firstName = "there",
}) => {
    const appUrl = getEmailConfig().appUrl;

    if (!resetUrl && !token) {
        return {
            success: false,
            message: "A password reset URL or token is required.",
        };
    }

    const resetLink =
        resetUrl ||
        `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

    const safeName = escapeHtml(firstName);
    const safeLink = escapeHtml(resetLink);

    return sendEmail({
        to,
        subject: "Reset your ShiftMate password",

        text: `
Hi ${firstName},

We received a request to reset your ShiftMate password.

Reset your password here:

${resetLink}

If you did not request this, you can ignore this email.

Thanks,
The ShiftMate Team
        `.trim(),

        html: `
            <div style="font-family:Arial,sans-serif;line-height:1.7;color:#333;max-width:600px;margin:auto;">
                <h2>Password Reset</h2>

                <p>Hi ${safeName},</p>

                <p>We received a request to reset your ShiftMate password.</p>

                <a href="${safeLink}"
                   style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
                    Reset Password
                </a>

                <p>If you did not request this, you can ignore this email.</p>

                <p>Thanks,<br/>The ShiftMate Team</p>
            </div>
        `,
    });
};

// ==========================================
// 9. VERIFY EMAIL CONNECTION
// ==========================================

const verifyEmailConnection = async () => {
    const transporter = createTransporter();

    if (!transporter) {
        return {
            success: false,
            message: "Email service is not configured.",
        };
    }

    try {
        await transporter.verify();

        return {
            success: true,
            message: "Email service connection verified successfully.",
        };
    } catch (error) {
        console.error("Email connection failed:", error.message);

        return {
            success: false,
            message: "Unable to verify email connection.",
            errorCode: error.code || "EMAIL_CONNECTION_FAILED",
        };
    }
};

// ==========================================
// 10. EXPORT EMAIL FUNCTIONS
// ==========================================

module.exports = {
    getEmailConfig,
    createTransporter,
    sendEmail,
    sendWelcomeEmail,
    sendInvitationEmail,
    sendPasswordResetEmail,
    verifyEmailConnection,
};