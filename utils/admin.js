const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const emailRegex =
  /^([a-zA-Z0-9\.-_]+)@([a-zA-Z0-9-_]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/;
const passwordSchema = require("../services/pwValidator");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const logoPath = path.join(__dirname, "../assets/csb_logo_letter.png");

/**
 * @function userNameExists
 * @description Check if the username exists in the database
 * @param {String} userName
 * @returns {Boolean} true if the username exists, false otherwise
 */
async function userNameExists(userName) {
  const adminPseudoInDB = await Admin.findByUserName(userName);
  if (adminPseudoInDB) {
    return true;
  }
  return false;
}

/** 
 * @function emailExists
 * @description Check if the email exists in the database
 * @param {String} email
 * @returns {Boolean} true if the email exists, false otherwise
*/
async function emailExists(email) {
  const adminEmailInDB = await Admin.findByEmail(email);
  if (adminEmailInDB) {
    return true;
  }
  return false;
}

/**
 * @function createToken
 * @description Create a token
 * @param {Object} admin
 * @param {String} expiresIn
 * @returns {String} token
 */
async function createToken(admin, expiresIn) {
  const token = jwt.sign(
    {
      email: admin.email,
      _id: admin._id,
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: expiresIn,
    }
  );
  return token;
}

/**
 * @function hashPassword
 * @description Hash the password
 * @param {String} password
 * @returns {String} hashedPassword
 */
async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
}

/**
 * @function isStrongPassword
 * @description Check if the password is strong
 * @param {String} password
 * @returns {Boolean} true if the password is strong, false otherwise
 */
function isStrongPassword(password) {
  const passwordErrors = passwordSchema.validate(password, { list: true });
  if (passwordErrors.length > 0) {
    return false;
  }
  return true;
}

/**
 * @function emailIsValid
 * @description Check if the email is valid
 * @param {String} email
 * @returns {Boolean} true if the email is valid, false otherwise
 */
function emailIsValid(email) {
  return emailRegex.test(email);
}

/**
 * @function isSuperAdmin
 * @description Check if the admin is a super admin
 * @param {String} token
 * @returns {Boolean} true if the admin is a super admin, false otherwise
 */
async function isSuperAdmin(token) {
  const id = decodedId(token);
  const admin = await Admin.findById(id);
  if (admin.isSuperAdmin) {
    return true;
  } else {
    return false;
  }
}

/**
 * @function decodedId
 * @description Decode the id from the token
 * @param {String} token
 * @returns {String} id
 */
function decodedId(token) {
  const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET, {
    algorithm: "HS256",
  });
  return decodedToken._id;
}

/**
 * @function decodedEmail
 * @description Decode the email from the token
 * @param {String} token
 * @returns {String} email 
 */
function decodedEmail(token) {
  const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET, {
    algorithm: "HS256",
  });
  return decodedToken.email;
}

/**
 * @function sendInvitation
 * @description Send an invitation to create an account
 * @param {String} token
 * @param {String} id
 * @param {String} protocol
 * @throws {Object} error
 */
async function sendInvitation(token, id, protocol) {
  // Update the create password token in the database
  const admin = await Admin.updateCreatePasswordToken(id, token);
  const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve("./views/"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./views/"),
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
  });
  const mailOptions = {
    from: process.env.EMAIL,
    to: admin.email,
    subject: "Création de compte Caen street Ball",
    template: "adminTemplate",
    context: {
      firstName: admin.firstName,
      lastName: admin.lastName,
      link: `${protocol}://${process.env.FRONT_HOST}/admin/create-password/${id}/${token}`,
    },
    attachments: [
      {
        filename: "csb_logo_letter.png",
        path: logoPath,
        cid: "Logo",
      },
    ],
  };
  transporter.use("compile", hbs(handlebarOptions));
  try {
    // Send the email
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
}

/**
 * @function sendForgetPasswordEmail
 * @description Send an email to reset the password
 * @param {String} token
 * @param {Object} admin
 * @param {String} protocol
 * @throws {Object} error
 */
async function sendForgetPasswordEmail(token, admin, protocol) {
  const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve("./views/"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./views/"),
  };
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
  });
  const mailOptions = {
    from: process.env.EMAIL,
    to: admin.email,
    subject: "Réinitialisation de mot de passe",
    template: "forgetPasswordTemplate",
    context: {
      firstName: admin.firstName,
      lastName: admin.lastName,
      link: `${protocol}://${process.env.FRONT_HOST}/admin/forget-password/${admin._id}/${token}`,
    },
    attachments: [
      {
        filename: "csb_logo_letter.png",
        path: logoPath,
        cid: "Logo",
      },
    ],
  };
  transporter.use("compile", hbs(handlebarOptions));
  try {
    // Send the email
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
}

module.exports = {
  userNameExists,
  emailExists,
  createToken,
  hashPassword,
  isStrongPassword,
  emailIsValid,
  isSuperAdmin,
  decodedId,
  sendInvitation,
  decodedEmail,
  sendForgetPasswordEmail,
};
