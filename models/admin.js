const ProxyDb = require('../config/connector/ProxyDB');
const AdminSchema = require('../schemas/admin')

class Admin {
    constructor(firstName, lastName, email, password, isSuperAdmin, _id) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.isSuperAdmin = isSuperAdmin;
        this._id = _id;
    }

    static async findByEmail(email) {
        return await ProxyDb.searchObject(AdminSchema, {email: email});
    }

    static async findById(id) {
        return await ProxyDb.loadObject(AdminSchema, {_id: id});
    }

    static async findByUserName(userName) {
        return await ProxyDb.searchObject(AdminSchema, {userName: userName});
    }

    async save() {
        return await ProxyDb.saveObject(AdminSchema, this.toMap());
    }

    static async getAdmins() {
        return await ProxyDb.loadObjects(AdminSchema);
    }

    async deleteAdmin(id) {
        return await ProxyDb.deleteObject(this, id);
    }

    async updateAdmin() {
        // TO DO find another solution to update admin
        const admin = this.toMap();
        delete admin.password;
        return await ProxyDb.saveObject(AdminSchema, admin);
    }

    static async updatePassword(id, password) {
        return await ProxyDb.saveObject(AdminSchema, {_id: id, password: password});
    }


    toMap() {
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            password: this.password,
            isSuperAdmin: this.isSuperAdmin,
            _id: this._id
        }
    }

    static fromMap(map) {
        return new Admin(map.firstName, map.lastName, map.email, map.password, map.isSuperAdmin, map._id);
    }
}

module.exports = Admin;