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

async function userNameExists(userName) {
  const adminPseudoInDB = await Admin.findByUserName(userName);
  if (adminPseudoInDB) {
    return true;
  }
  return false;
}

async function emailExists(email) {
  const adminEmailInDB = await Admin.findByEmail(email);
  if (adminEmailInDB) {
    return true;
  }
  return false;
}

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

async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
}

function isStrongPassword(password) {
  const passwordErrors = passwordSchema.validate(password, { list: true });
  if (passwordErrors.length > 0) {
    return false;
  }
  return true;
}

function emailIsValid(email) {
  return emailRegex.test(email);
}

async function isSuperAdmin(token) {
  const id = decodedId(token);
  const admin = await Admin.findById(id);
  if (admin.isSuperAdmin) {
    return true;
  } else {
    return false;
  }
}

function decodedId(token) {
  const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET, {
    algorithm: "HS256",
  });
  return decodedToken._id;
}

function decodedEmail(token) {
  const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET, {
    algorithm: "HS256",
  });
  return decodedToken.email;
}

async function sendInvitation(token, id, protocol) {
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
};
