const ErrorHandler = require("../models/errorHandler");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const logoPath = path.join(__dirname, "../assets/csb_logo_letter.png");

/**
 * @controller sendEmail
 * @desc Send an email to the user and the admin when the user sends a message
 */
exports.sendEmail = async (req, res) => {
    try {
        // Check if the fields are empty
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return new ErrorHandler(400, "EMPTY_FIELDS").send(res);
        }
        // Create the transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
        });
        const handlebarOptions = {
            viewEngine: {
            partialsDir: path.resolve("./views/"),
            defaultLayout: false,
            },
            viewPath: path.resolve("./views/"),
        };
        const mailOptions = {
            from: process.env.EMAIL,
            to: req.body.email,
            subject: "Modification de tournois Caen street Ball",
            template: "contactUserTemplate",
            context: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
            },
            attachments: [
                {
                filename: "csb_logo_letter.png",
                path: logoPath,
                cid: "Logo",
                },
            ],
        };
        // Send the email
        transporter.use("compile", hbs(handlebarOptions));
        try {
            await transporter.sendMail(mailOptions);
        } catch (err) {
            throw {
                status: 500,
                message: {
                error: "NODEMAILER_ERROR",
                message: err,
                },
            };
        }
        const adminTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
        });
        const adminHandlebarOptions = {
            viewEngine: {
            partialsDir: path.resolve("./views/"),
            defaultLayout: false,
            },
            viewPath: path.resolve("./views/"),
        };
        const adminMailOptions = {
            from: process.env.EMAIL,
            to: req.body.email,
            subject: "Modification de tournois Caen street Ball",
            template: "contactAdminTemplate",
            context: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                message: req.body.message,
                phone: req.body.phone,
            },
            attachments: [
                {
                filename: "csb_logo_letter.png",
                path: logoPath,
                cid: "Logo",
                },
            ],
        };
            adminTransporter.use("compile", hbs(adminHandlebarOptions));
        try {
            await adminTransporter.sendMail(adminMailOptions);
        } catch (err) {
            throw {
                status: 500,
                message: {
                error: "NODEMAILER_ERROR",
                message: err,
                },
            };
        }
        return res.status(200).json({ message: "EMAIL_SENT" });
    } catch (err) {
        return new ErrorHandler(err.status, err.message).send(res);
    }
}