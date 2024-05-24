const Admin = require("../models/admin");
const adminUtils = require("../utils/admin");
const ErrorHandler = require("../models/errorHandler");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");


/**
 * @controller createAdmin
 * @description Create a new admin
 */
exports.createAdmin = async (req, res, next) => {
  try {
    //Check if the user is a super admin
    const isSuperAdmin = adminUtils.isSuperAdmin(req.cookies.token);
    if (!isSuperAdmin) {
        return new ErrorHandler(
            401,
            {
                error: "UNAUTHORIZED_REQUEST",
                message: "this user is not allowed to perform this request"
            }
        ).send(res);
    }
    //Check if email | username already exists
    let errors = [];
    if (await adminUtils.emailExists(req.body.email)) {
      errors.push({ error: "EMAIL_EXISTS", message: "Email already exists" });
    }
    // check if the email is valid
    if (!adminUtils.emailIsValid(req.body.email)) {
      errors.push({ error: "INVALID_EMAIL", message: "Email is invalid" });
    }
    // check if the password is strong
    if (errors.length > 0) {
      return new ErrorHandler(400, errors).send(res);
    }
    const admin = new Admin(
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      null,
      req.body.isSuperAdmin ? req.body.isSuperAdmin : false,
      null,
      "pending",
      null,
      null
    );
    //Save the admin in the database
    const adminDB = await admin.save();
    // Create a token for the password creation
    const createPasswordToken = await adminUtils.createToken(
      { email: req.body.email },
      "1h"
    );
    await adminUtils.sendInvitation(
      createPasswordToken,
      adminDB._id,
      req.protocol
    );
    return res.status(201).json({
      message: "Admin created",
      admin: adminDB,
    });
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};

/**
  * @controller forgetPassword
  * @description Send an email to the admin with a link to reset his password
 */
exports.forgetPassword = async (req, res, next) => {
  try {
    // Find the admin by email in the database
    const admin = await Admin.findByEmail(req.body.email);
    // If the admin doesn't exist, return an error
    if (!admin) {
      return new ErrorHandler(404, {
        error: "UNKNOW_EMAIL",
        message: "Email not found",
      }).send(res);
    }
    // If the admin doesn't have a password, return an error
    if (!admin.password) {
      return new ErrorHandler(400, {
        error: "NO_PASSWORD",
        message: "No password found",
      }).send(res);
    }
    // Create a token for the password creation
    const forgetPasswordToken = await adminUtils.createToken(
      { email: req.body.email },
      "1h"
    );
    // Update the admin with the token
    await Admin.updateForgetPasswordToken(admin._id, forgetPasswordToken);
    // Send the email to the admin with the token in the link
    adminUtils.sendForgetPasswordEmail(
      forgetPasswordToken,
      admin,
      req.protocol
    );
    return res.status(200).json({ message: "Email sent" });
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};

/**
 * @controller resetPassword
 * @description Reset the password of the admin
 */
exports.resetPassword = async (req, res, next) => {
  try {
    // Find the admin by id in the database
    const admin = await Admin.findById(req.params.id);
    // If the admin doesn't exist, return an error
    if (!admin) {
      return new ErrorHandler(404, {
        error: "UNKNOW_ADMIN",
        message: "Admin not found",
      }).send(res);
    }
    // If the token doesn't match the admin email, return an error
    if (!adminUtils.isStrongPassword(req.body.password)) {
      return new ErrorHandler(400, {
        error: "WEAK_PASSWORD",
        message:
          "The new password doesn't match the rules for a strong password",
      }).send(res);
    }
    // Hash the password
    const hashedPassword = await adminUtils.hashPassword(req.body.password);
    // Update the admin password in the database
    await Admin.updatePassword(admin._id, hashedPassword);
    // Delete the token in the database
    await Admin.deleteForgetPasswordToken(admin._id);
    return res.status(200).json({ message: "Password updated" });
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};

/**
 * @controller checkToken
 * @description Check if the token is valid 
 */
exports.checkToken = async (req, res, next) => {
  try {
    // Find the admin by id in the database
    const admin = await Admin.findById(req.params.id);
    // get the email from the token
    const email = adminUtils.decodedEmail(req.params.token);
    // If the email doesn't match the token, return an error
    if (email != admin.email) {
      return new ErrorHandler(400, {
        error: "INVALID_EMAIL",
        message: "Email doesn't match the token",
      }).send(res);
    }
    // If the token is the create password token, return 200
    if (
      admin.createPasswordToken != null &&
      admin.createPasswordToken === req.params.token
    ) {
      return res.status(200).json();
    }
    // If the token is the forget password token, return 200
    if (
      admin.forgetPasswordToken != null &&
      admin.forgetPasswordToken === req.params.token
    ) {
      return res.status(200).json();
    }
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};

/**
 * @controller login
 * @description Login the admin
 */
exports.login = async (req, res, next) => {
  try {
    // create an array to store the errors
    const errors = [];
    const admin = await Admin.findByEmail(req.body.email);
    // if the admin doesn't exist, push email error and password error
    if (!admin) {
      errors.push({
        error: "UNKNOW_EMAIL",
        message: "Auth failled - Unknow email",
      });
      errors.push({
        error: "INVALID_PASSWORD",
        message: "Auth failled - Invalid password",
      });
    }

    // if the admin doesn't have a password, push password error
    if (admin && !admin.password) {
      errors.push({
        error: "NO_PASSWORD",
        message: "Auth failled - No password found",
      });
    }

    // if admin has a password, check if the password matches the database password
    if (admin && admin.password) {
      const isPasswordMatches = await bcrypt.compare(
        req.body.password,
        admin.password
      );
      // if the password doesn't match, push password error
      if (!isPasswordMatches) {
        errors.push({
          error: "INVALID_PASSWORD",
          message: "Auth failled - Invalid password",
        });
      }
    }
    // if the errors array is not empty, return the errors
    if (errors.length > 0) {
      return new ErrorHandler(401, errors).send(res);
    }

    // create a token for the admin
    const token = await adminUtils.createToken(admin, "12h");
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 43200000,
    });
    return res.status(200).json({
      message: "Auth success",
      user: {
        _id: admin._id,
        email: admin.email,
        isSuperAdmin: admin.isSuperAdmin,
      },
    });
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};

/**
 * @controller logout
 * @description Logout the admin
 */
exports.logout = async (req, res, next) => {
  try {
    // clear the token cookie
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout success" });
  } catch (error) {
    return new ErrorHandler(500, {
      error: "LOGOUT_ERROR",
      message: error,
    }).send(res);
  }
};

/**
 * @controller sendInvitation
 * @description Send an invitation to a new admin
 */
exports.sendInvitation = async (req, res, next) => {
  try {
    // Get the admin by id
    const admin = await Admin.findById(req.params.id);
    // create a token for the password creation
    const createPasswordToken = await adminUtils.createToken(
      { email: admin.email },
      "1h"
    );
    // send the invitation email
    await adminUtils.sendInvitation(
      createPasswordToken,
      req.params.id,
      req.protocol
    );
    return res.status(200).json({ message: "Invitation sent" });
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};

/**
 * @controller deleteAdmin
 * @description Delete an admin
 */
exports.deleteAdmin = async (req, res, next) => {
  try {
    // check if the user is a super admin
    const isSuperAdmin = await adminUtils.isSuperAdmin(req.cookies.token);
    // get the admin id from the token
    const adminIdToken = await adminUtils.decodedId(req.cookies.token);
    // if the user is not a super admin and the id is different from the token id, return an error
    if (!isSuperAdmin && req.params.id != adminIdToken) {
      return new ErrorHandler(401, {
        error: "UNAUTHORIZED_REQUEST",
        message: "this user is not allowed to perform this request",
      }).send(res);
    }
    // if the id is the same as the token id, clear the token cookie
    if (req.params.id === adminIdToken) {
      res.clearCookie("token");
    }
    // delete the admin from the database
    const admin = await Admin.deleteAdmin(req.params.id);
    const adminwhitoutPassword = delete admin.password;
    return res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
};

/**
 * @controller updateAdmin
 * @description Update an admin
 */
exports.updateAdmin = async (req, res, next) => {
  try {
    // check if the email is valid
    if (req.body.email || req.body.userName) {
      if (!adminUtils.emailIsValid(req.body.email)) {
        throw {
          status: 400,
          message: { error: "INVALID_EMAIL", message: "Email is invalid" },
        };
      }
    }
    // check if all the fields are not empty
    for (const property in req.body) {
      if (req.body[property].length === 0) {
        throw {
          status: 400,
          message: { error: "EMPTY_FIELD", message: `${property} is empty` },
        };
      }
    }
    // check if the user is a super admin
    const admin = await Admin.findById(req.params.id);
    const isSuperAdmin = await adminUtils.isSuperAdmin(req.cookies.token);
    // get the admin id from the token
    const adminIdToken = await adminUtils.decodedId(req.cookies.token);
    // if the user is not a super admin and the id is different from the token id, return an error
    if (!isSuperAdmin && req.params.id != adminIdToken) {
      return new ErrorHandler(401, {
        error: "UNAUTHORIZED_REQUEST",
        message: "this user is not allowed to perform this request",
      }).send(res);
    }
    const adminToUpdate = new Admin(
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      req.body.password,
      req.body.isSuperAdmin,
      req.params.id,
      req.body.status
    );
    // update the admin in the database
    const adminUpdated = await adminToUpdate.updateAdmin();
    const adminwhitoutPassword = delete adminUpdated.password;
    return res.status(200).json(adminwhitoutPassword);
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};

/**
 * @controller updatePassword
 * @description Update the password of the admin 
 */
exports.updatePassword = async (req, res, next) => {
  try {
    // find the admin by id
    const admin = await Admin.findById(req.params.id);
    // check if the old password matches the database password
    const isPasswordMatches = await bcrypt.compare(
      req.body.oldPassword,
      admin.password
    );
    // if the password doesn't match, return an error
    if (!isPasswordMatches) {
      return new ErrorHandler(401, {
        error: "INVALID_PASSWORD",
        message: "the old password doesn't not match the database password",
      }).send(res);
    }
    // check if the new password is strong
    if (!adminUtils.isStrongPassword(req.body.newPassword)) {
      return new ErrorHandler(400, {
        error: "WEAK_PASSWORD",
        message:
          "The new password doesn't match the rules for a strong password",
      }).send(res);
    }
    // hash the new password
    const hashedPassword = await adminUtils.hashPassword(req.body.newPassword);
    // update the admin password in the database
    admin.password = hashedPassword;
    const adminToUpdate = new Admin(
      admin.firstName,
      admin.lastName,
      admin.email,
      hashedPassword,
      admin.isSuperAdmin,
      admin._id
    );
    // update the admin in the database
    const adminUpdated = await adminToUpdate.updateAdmin({
      password: hashedPassword,
    });
    // delete the password from the response
    const adminwhitoutPassword = delete adminUpdated.password;
    return res.status(200).json({
      message: "Password updated",
      admin: adminwhitoutPassword,
    });
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};

/**
 * @controller createPassword
 * @description Create a password for the admin
 */
exports.createPassword = async (req, res, next) => {
  try {
    // find the admin by id
    const admin = await Admin.findById(req.params.id);
    // if the admin doesn't exist, return an error
    if (!admin) {
      return new ErrorHandler(404, {
        error: "UNKNOW_ADMIN",
        message: "Admin not found",
      }).send(res);
    }
    // if the password is not strong, return an error
    if (!adminUtils.isStrongPassword(req.body.password)) {
      return new ErrorHandler(400, {
        error: "WEAK_PASSWORD",
        message:
          "The new password doesn't match the rules for a strong password",
      }).send(res);
    }
    // hash the password
    const hashedPassword = await adminUtils.hashPassword(req.body.password);
    // update the admin password in the database
    admin.password = hashedPassword;
    // update the admin status in the database
    await Admin.updatePassword(admin._id, hashedPassword);
    const adminWithUpdatedStatus = await Admin.updateStatus(
      admin._id,
      "active"
    );
    const adminwhitoutPassword = delete adminWithUpdatedStatus.password;
    await Admin.deleteCreatePasswordToken(admin._id);
    return res.status(200).json({
      message: "Password created",
      admin: adminwhitoutPassword,
    });
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};

/**
 * @controller getAdmin
 * @description Get an admin
 */
exports.getAdmins = async (req, res, next) => {
  try {
    // get all the admins from the database
    const adminToUpdate = await Admin.getAdmins();
    adminToUpdate.map(async (admin) => {
      try {
        // if the admin has a create password token, verify the token
        if (admin.createPasswordToken) {
          jwt.verify(admin.createPasswordToken, process.env.TOKEN_SECRET, {
            algorithm: "HS256",
          });
          // if the token is valid, update the status to pending
          await Admin.updateStatus(admin._id, "pending");
        }
      } catch (error) {
        // if the token is invalid, update the status to expired
        await Admin.updateStatus(admin._id, "expired");
      }
    });
    // get all the admins from the database
    const admins = await Admin.getAdmins();
    // delete the password in all the admins
    const adminsWithoutPassword = admins.map((admin) => {
      delete admin.password;
      return admin;
    });
    return res.status(200).json(adminsWithoutPassword);
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};
