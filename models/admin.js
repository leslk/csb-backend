const ProxyDb = require("../config/connector/ProxyDB");
const AdminSchema = require("../schemas/admin");

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

  static async findByEmail(email) {
    return await ProxyDb.searchObject(AdminSchema, { email: email });
  }

  static async findById(id) {
    return await ProxyDb.loadObject(AdminSchema, { _id: id });
  }

  static async findByUserName(userName) {
    return await ProxyDb.searchObject(AdminSchema, { userName: userName });
  }

  async save() {
    return await ProxyDb.saveObject(AdminSchema, this.toMap());
  }

  static async getAdmins() {
    return await ProxyDb.loadObjects(AdminSchema);
  }

  static async deleteAdmin(id) {
    return await ProxyDb.deleteObject(AdminSchema, id);
  }

  static async deleteCreatePasswordToken(id) {
    return await ProxyDb.saveObject(AdminSchema, {
      _id: id,
      createPasswordToken: null,
    });
  }

  static async deleteForgetPasswordToken(id) {
    return await ProxyDb.saveObject(AdminSchema, {
      _id: id,
      forgetPasswordToken: null,
    });
  }

  static async updateForgetPasswordToken(id, token) {
    return await ProxyDb.saveObject(AdminSchema, {
      _id: id,
      forgetPasswordToken: token,
    });
  }

  static async updateCreatePasswordToken(id, token) {
    return await ProxyDb.saveObject(AdminSchema, {
      _id: id,
      createPasswordToken: token,
    });
  }

  async updateAdmin() {
    // TO DO find another solution to update admin
    const admin = this.toMap();
    return await ProxyDb.saveObject(AdminSchema, admin);
  }

  static async updatePassword(id, password) {
    return await ProxyDb.saveObject(AdminSchema, {
      _id: id,
      password: password,
      createPasswordToken: null,
      forgetPasswordToken: null,
    });
  }

  static async updateStatus(id, status) {
    return await ProxyDb.saveObject(AdminSchema, { _id: id, status: status });
  }

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
