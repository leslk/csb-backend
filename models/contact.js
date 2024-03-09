const ProxyDb = require('./config/connector/ProxyDB');

class Contact {
    constructor(email, phoneNumber, facebookLink, instagramLink, _id) {
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.facebookLink = facebookLink;
        this.instagramLink = instagramLink;
        this._id = _id;
    }

    static async getContact(id) {
        return await ProxyDb.loadObject(this, id);
    }

    static async updateContact(contact) {
        return await ProxyDb.saveObject(this, contact);
    }

    static async createContact(contact) {
        return await ProxyDb.saveObject(this, contact);
    }

    toMap() {
        return {
            email: this.email,
            phoneNumber: this.phoneNumber,
            facebookLink: this.facebookLink,
            instagramLink: this.instagramLink
        }
    }

    static fromMap(map) {
        return new Contact(map.email, map.phoneNumber, map.facebookLink, map.instagramLink, map._id);
    }
}