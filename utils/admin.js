const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const emailRegex = /^([a-zA-Z0-9\.-_]+)@([a-zA-Z0-9-_]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/;
const passwordSchema = require('../services/pwValidator');

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

async function createToken(admin) {
    const token = jwt.sign({
        email: admin.email,
        _id: admin._id
    }, process.env.TOKEN_SECRET, {
        expiresIn: "12h"
    });
    return token;
}

async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
}

function isStrongPassword(password) {
    const passwordErrors = passwordSchema.validate(password, {list: true});
    if (passwordErrors.length > 0) {
        return false;
    }
    return true;
}

function emailIsValid(email) {
    return emailRegex.test(email);
}

module.exports = {userNameExists, emailExists, createToken, hashPassword, isStrongPassword, emailIsValid};