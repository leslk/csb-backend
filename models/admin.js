const ProxyDb = require("../config/connector/ProxyDB");
const AdminSchema = require("../schemas/admin");

/**
 * @class Admin
 * @description Admin class
 * @param {String} firstName
 * @param {String} lastName
 * @param {String} email
 * @param {String} password
 * @param {Boolean} isSuperAdmin
 * @param {String} _id
 * @param {String} status
 * @param {String} createPasswordToken
 * @param {String} ForgetPasswordToken
 */
class Admin {
  constructor(
    firstName,
    lastName,
    email,
    password,
    isSuperAdmin,
    _id,
    status,
    createPasswordToken,
    ForgetPasswordToken
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.isSuperAdmin = isSuperAdmin;
    this._id = _id;
    this.status = status;
    this.createPasswordToken = createPasswordToken;
    this.ForgetPasswordToken = ForgetPasswordToken;
  }

  // find admin by email
  static async findByEmail(email) {
    return await ProxyDb.searchObject(AdminSchema, { email: email });
  }

  // find admin by id
  static async findById(id) {
    return await ProxyDb.loadObject(AdminSchema, { _id: id });
  }

  // find admin by username
  static async findByUserName(userName) {
    return await ProxyDb.searchObject(AdminSchema, { userName: userName });
  }

  // save admin
  async save() {
    return await ProxyDb.saveObject(AdminSchema, this.toMap());
  }

  // get all admins
  static async getAdmins() {
    return await ProxyDb.loadObjects(AdminSchema);
  }

  // delete admin
  static async deleteAdmin(id) {
    return await ProxyDb.deleteObject(AdminSchema, id);
  }

  // delete create password token
  static async deleteCreatePasswordToken(id) {
    return await ProxyDb.saveObject(AdminSchema, {
      _id: id,
      createPasswordToken: null,
    });
  }

  // delete forget password token
  static async deleteForgetPasswordToken(id) {
    return await ProxyDb.saveObject(AdminSchema, {
      _id: id,
      forgetPasswordToken: null,
    });
  }

  // update forget password token
  static async updateForgetPasswordToken(id, token) {
    return await ProxyDb.saveObject(AdminSchema, {
      _id: id,
      forgetPasswordToken: token,
    });
  }

  // update create password token
  static async updateCreatePasswordToken(id, token) {
    return await ProxyDb.saveObject(AdminSchema, {
      _id: id,
      createPasswordToken: token,
    });
  }

  // update admin
  async updateAdmin() {
    const admin = this.toMap();
    return await ProxyDb.saveObject(AdminSchema, admin);
  }

  // update password
  static async updatePassword(id, password) {
    return await ProxyDb.saveObject(AdminSchema, {
      _id: id,
      password: password,
      createPasswordToken: null,
      forgetPasswordToken: null,
    });
  }

  // update status
  static async updateStatus(id, status) {
    return await ProxyDb.saveObject(AdminSchema, { _id: id, status: status });
  }

  // transform admin to an object
  toMap() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      isSuperAdmin: this.isSuperAdmin,
      _id: this._id,
      status: this.status,
      createPasswordToken: this.createPasswordToken,
      ForgetPasswordToken: this.ForgetPasswordToken,
    };
  }

  // transform map to admin instance
  static fromMap(map) {
    return new Admin(
      map.firstName,
      map.lastName,
      map.email,
      map.password,
      map.isSuperAdmin,
      map._id,
      map.status,
      map.createPasswordToken,
      map.ForgetPasswordToken,
      map._id
    );
  }
}

module.exports = Admin;
