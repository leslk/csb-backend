const Admin = require("../models/admin");
const adminUtils = require("../utils/admin");
const ErrorHandler = require("../models/errorHandler");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");

exports.createAdmin = async (req, res, next) => {
  try {
    // const isSuperAdmin = adminUtils.isSuperAdmin(req.cookies.token);
    // if (!isSuperAdmin) {
    //     return new ErrorHandler(
    //         401,
    //         {
    //             error: "UNAUTHORIZED_REQUEST",
    //             message: "this user is not allowed to perform this request"
    //         }
    //     ).send(res);
    // }
    // Check if email | username already exists
    let errors = [];
    if (await adminUtils.emailExists(req.body.email)) {
      errors.push({ error: "EMAIL_EXISTS", message: "Email already exists" });
    }

    if (!adminUtils.emailIsValid(req.body.email)) {
      errors.push({ error: "INVALID_EMAIL", message: "Email is invalid" });
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
      null,
      "pending",
      null,
      null
    );
    const adminDB = await admin.save();
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

exports.forgetPassword = async (req, res, next) => {
  try {
    const admin = await Admin.findByEmail(req.body.email);
    if (!admin) {
      return new ErrorHandler(404, {
        error: "UNKNOW_EMAIL",
        message: "Email not found",
      }).send(res);
    }
    if (!admin.password) {
      return new ErrorHandler(400, {
        error: "NO_PASSWORD",
        message: "No password found",
      }).send(res);
    }
    const forgetPasswordToken = await adminUtils.createToken(
      { email: req.body.email },
      "1h"
    );
    await Admin.updateForgetPasswordToken(admin._id, forgetPasswordToken);
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

exports.resetPassword = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return new ErrorHandler(404, {
        error: "UNKNOW_ADMIN",
        message: "Admin not found",
      }).send(res);
    }
    if (!adminUtils.isStrongPassword(req.body.password)) {
      return new ErrorHandler(400, {
        error: "WEAK_PASSWORD",
        message:
          "The new password doesn't match the rules for a strong password",
      }).send(res);
    }
    const hashedPassword = await adminUtils.hashPassword(req.body.password);
    await Admin.updatePassword(admin._id, hashedPassword);
    await Admin.deleteForgetPasswordToken(admin._id);
    return res.status(200).json({ message: "Password updated" });
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};

exports.checkToken = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    const email = adminUtils.decodedEmail(req.params.token);
    if (email != admin.email) {
      return new ErrorHandler(400, {
        error: "INVALID_EMAIL",
        message: "Email doesn't match the token",
      }).send(res);
    }
    if (
      admin.createPasswordToken != null &&
      admin.createPasswordToken === req.params.token
    ) {
      return res.status(200).json();
    }
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

exports.login = async (req, res, next) => {
  try {
    const errors = [];
    const admin = await Admin.findByEmail(req.body.email);
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

    if (admin && !admin.password) {
      errors.push({
        error: "NO_PASSWORD",
        message: "Auth failled - No password found",
      });
    }
    if (admin && admin.password) {
      const isPasswordMatches = await bcrypt.compare(
        req.body.password,
        admin.password
      );
      if (!isPasswordMatches) {
        errors.push({
          error: "INVALID_PASSWORD",
          message: "Auth failled - Invalid password",
        });
      }
    }
    if (errors.length > 0) {
      return new ErrorHandler(401, errors).send(res);
    }

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

exports.logout = async (req, res, next) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout success" });
  } catch (error) {
    return new ErrorHandler(500, {
      error: "LOGOUT_ERROR",
      message: error,
    }).send(res);
  }
};

exports.sendInvitation = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    const createPasswordToken = await adminUtils.createToken(
      { email: admin.email },
      "1h"
    );
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

exports.deleteAdmin = async (req, res, next) => {
  try {
    const isSuperAdmin = await adminUtils.isSuperAdmin(req.cookies.token);
    const adminIdToken = await adminUtils.decodedId(req.cookies.token);
    if (!isSuperAdmin && req.params.id != adminIdToken) {
      return new ErrorHandler(401, {
        error: "UNAUTHORIZED_REQUEST",
        message: "this user is not allowed to perform this request",
      }).send(res);
    }
    if (req.params.id === adminIdToken) {
      res.clearCookie("token");
    }
    const admin = await Admin.deleteAdmin(req.params.id);
    return res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
};

exports.updateAdmin = async (req, res, next) => {
  try {
    if (req.body.email || req.body.userName) {
      if (!adminUtils.emailIsValid(req.body.email)) {
        throw {
          status: 400,
          message: { error: "INVALID_EMAIL", message: "Email is invalid" },
        };
      }
    }
    for (const property in req.body) {
      if (req.body[property].length === 0) {
        throw {
          status: 400,
          message: { error: "EMPTY_FIELD", message: `${property} is empty` },
        };
      }
    }
    const admin = await Admin.findById(req.params.id);
    const isSuperAdmin = await adminUtils.isSuperAdmin(req.cookies.token);
    const adminIdToken = await adminUtils.decodedId(req.cookies.token);
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
    const adminUpdated = await adminToUpdate.updateAdmin();
    const adminwhitoutPassword = delete adminUpdated.password;
    return res.status(200).json(adminwhitoutPassword);
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    const isPasswordMatches = await bcrypt.compare(
      req.body.oldPassword,
      admin.password
    );
    if (!isPasswordMatches) {
      return new ErrorHandler(401, {
        error: "INVALID_PASSWORD",
        message: "the old password doesn't not match the database password",
      }).send(res);
    }

    if (!adminUtils.isStrongPassword(req.body.newPassword)) {
      return new ErrorHandler(400, {
        error: "WEAK_PASSWORD",
        message:
          "The new password doesn't match the rules for a strong password",
      }).send(res);
    }
    const hashedPassword = await adminUtils.hashPassword(req.body.newPassword);
    admin.password = hashedPassword;
    const adminToUpdate = new Admin(
      admin.firstName,
      admin.lastName,
      admin.email,
      hashedPassword,
      admin.isSuperAdmin,
      admin._id
    );
    const adminUpdated = await adminToUpdate.updateAdmin({
      password: hashedPassword,
    });
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

exports.createPassword = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return new ErrorHandler(404, {
        error: "UNKNOW_ADMIN",
        message: "Admin not found",
      }).send(res);
    }
    if (!adminUtils.isStrongPassword(req.body.password)) {
      return new ErrorHandler(400, {
        error: "WEAK_PASSWORD",
        message:
          "The new password doesn't match the rules for a strong password",
      }).send(res);
    }
    const hashedPassword = await adminUtils.hashPassword(req.body.password);
    admin.password = hashedPassword;
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

exports.getAdmins = async (req, res, next) => {
  try {
    const adminToUpdate = await Admin.getAdmins();
    adminToUpdate.map(async (admin) => {
      try {
        if (admin.createPasswordToken) {
          jwt.verify(admin.createPasswordToken, process.env.TOKEN_SECRET, {
            algorithm: "HS256",
          });
          await Admin.updateStatus(admin._id, "pending");
        }
      } catch (error) {
        await Admin.updateStatus(admin._id, "expired");
      }
    });
    const admins = await Admin.getAdmins();
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
