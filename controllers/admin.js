const Admin = require('../models/admin');
const adminUtils = require('../utils/admin');
const ErrorHandler = require('../models/errorHandler');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const logoPath = path.join(__dirname, '../assets/logo.jpeg');
const jwt = require('jsonwebtoken');

exports.createAdmin = async (req, res, next) => {
    try {
        // Check if email | username already exists
        let errors = [];
        if (await adminUtils.emailExists(req.body.email)) {
            errors.push({error: "EMAIL_EXISTS", message: "Email already exists"});
        }

        if (!adminUtils.emailIsValid(req.body.email)) {
            errors.push({error: "INVALID_EMAIL", message: "Email is invalid"});
        }

        if (errors.length > 0) {
            return new ErrorHandler(400, errors).send(res);
        }

        const admin = new Admin(
            req.body.firstName,
            req.body.lastName,
            req.body.email,
            null,
            req.body.isSuperAdmin ? req.body.isSuperAdmin : false,
        );
        const adminDB = await admin.save();
        const handlebarOptions = {
            viewEngine: {
                partialsDir: path.resolve('./views/'),
                defaultLayout: false,
            },
            viewPath: path.resolve('./views/'),
        };

        const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL, pass: process.env.PASSWORD } });
        const mailOptions = { 
            from: process.env.EMAIL, 
            to: req.body.email, 
            subject:'Création de compte Caen street Ball', 
            template: 'adminTemplate',
            context:{
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                link: `${req.protocol}://${process.env.FRONT_HOST}/admin/${adminDB._id}`
            },
            attachments : [
                {
                    filename: 'logo.jpeg',
                    path: logoPath,
                    cid: "Logo"
                },
            ]

        };
        transporter.use('compile', hbs(handlebarOptions));
        try {
            await transporter.sendMail(mailOptions);

        } catch (err) {
            throw {status: 500, 
                message: {
                    error : "NODEMAILER_ERROR",
                    message: err
                }
            }
        }
        return res.status(201).json({
            message: "Admin created",
            admin: adminDB
        });
    }
    catch(error) {
        const errorHandler = new ErrorHandler(error.status, error.message);
        return errorHandler.send(res);
    };
}

exports.login = async (req, res, next) => {
    try {
        const errors = [];
        const admin = await Admin.findByEmail(req.body.email);
        if (!admin) {
            errors.push({error: "UNKNOW_EMAIL", message: "Auth failled - Unknow email"});
            errors.push({error: "INVALID_PASSWORD", message: "Auth failled - Invalid password"});
        }

        if (admin && admin.password) {
            const isPasswordMatches = await bcrypt.compare(req.body.password, admin.password);
            if (!isPasswordMatches) {
                errors.push({error: "INVALID_PASSWORD", message: "Auth failled - Invalid password"});
                
            }
        }

        if (errors.length > 0) {
            return new ErrorHandler(401, errors).send(res);
        }

        const token = await adminUtils.createToken(admin);
        res.cookie('token', token, {httpOnly: true, secure: false, maxAge: 43200000});
        return res.status(200).json({
            message: "Auth success",
            user: {
                _id: admin._id,
                email: admin.email,
                isSuperAdmin: admin.isSuperAdmin
            },
        });
    }
    catch(error) {
        const errorHandler = new ErrorHandler(error.status, error.message);
        return errorHandler.send(res);
    };
}

// TO DO add logout

exports.deleteAdmin = async (req, res, next) => {
    try {
        const admin = admin.findById(req.params.id);
        if (admin && admin.isSuperAdmin) {
            return new ErrorHandler(
                401,
                {
                    error: "UNAUTHORIZED_REQUEST", 
                    message: "this user is not allowed to perform this request"
                }
            ).send(res);
        }
        const adminToDelete = await Admin.deleteAdmin(req.params.id);
        return res.status(200).json(adminToDelete);
    }
    catch(error) {
        res.status(500).json({
            error: error
        });
    };

}

exports.updateAdmin = async (req, res, next) => {
    try {
        if (req.body.email || req.body.userName) {
            if (!adminUtils.emailIsValid(req.body.email)) {
                throw {status: 400, message: {error: "INVALID_EMAIL", message: "Email is invalid"}};
            }
        }
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET, { algorithm: 'HS256' }); 
        const id = decodedToken._id;
        const admin = await Admin.findById(id);
        if (!admin.isSuperAdmin && req.body.isSuperAdmin) {
            return new ErrorHandler(
                401,
                {
                    error: "UNAUTHORIZED_REQUEST", 
                    message: "this user is not allowed to perform this request"
                }
            ).send(res);
        }
        const adminToUpdate = new Admin(
            req.body.firstName,
            req.body.lastName,
            req.body.email,
            req.body.password,
            req.body.isSuperAdmin,
            req.params.id
        );
        const adminUpdated = await adminToUpdate.updateAdmin();
        const adminwhitoutPassword = delete adminUpdated.password;
        return res.status(200).json(adminwhitoutPassword);
    }
    catch(error) {
        const errorHandler = new ErrorHandler(error.status, error.message);
        return errorHandler.send(res);
    };

}

exports.updatePassword = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.params.id);
        const isPasswordMatches = await bcrypt.compare(req.body.oldPassword, admin.password);
        if (!isPasswordMatches) {
            return new ErrorHandler(
                401, 
                {
                    error: "INVALID_PASSWORD", 
                    message: "the old password doesn't not match the database password"
                }
            ).send(res);
        }

        if (!adminUtils.isStrongPassword(req.body.newPassword)) {
            return new ErrorHandler(
                400, 
                {
                    error: "WEAK_PASSWORD", 
                    message: "The new password doesn't match the rules for a strong password"
                }
            ).send(res);
        }

        const hashedPassword = await adminUtils.hashPassword(req.body.newPassword);
        admin.password = hashedPassword;
        const  adminToUpdate = new Admin(admin.userName, admin.email, hashedPassword, admin.isSuperAdmin, admin._id);
        const adminUpdated = await adminToUpdate.updateAdmin({password: hashedPassword});
        return res.status(200).json(
            {
                message: "Password updated",
                admin: adminUpdated
            }
        );
    }
    catch(error) {
        const errorHandler = new ErrorHandler(error.status, error.message);
        return errorHandler.send(res);
    };
}

exports.createPassword = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!adminUtils.isStrongPassword(req.body.password)) {
            return new ErrorHandler(
                400,
                {
                    error: "WEAK_PASSWORD", 
                    message: "The new password doesn't match the rules for a strong password"
                }
            ).send(res);
        }

        const hashedPassword = await adminUtils.hashPassword(req.body.password);
        admin.password = hashedPassword;
        const adminUpdated = await Admin.updatePassword(admin._id, hashedPassword);
        return res.status(200).json(
            {
                message: "Password created",
                admin: adminUpdated
            }
        );
    }
    catch(error) {
        const errorHandler = new ErrorHandler(error.status, error.message);
        return errorHandler.send(res);
    };
}

exports.getAdmins = async (req, res, next) => {
    try {
        const admins = await Admin.getAdmins();
        const adminsWithoutPassword = admins.map(admin => {
            return {
                _id: admin._id,
                firstName: admin.firstName,
                lastName: admin.lastName,
                userName: admin.userName,
                email: admin.email,
                isSuperAdmin: admin.isSuperAdmin
            }
        });
        return res.status(200).json(adminsWithoutPassword);
    }
    catch(error) {
        const errorHandler = new ErrorHandler(error.status, error.message);
        return errorHandler.send(res);
    };
}