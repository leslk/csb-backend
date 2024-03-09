const ProxyDb = require('./config/connector/ProxyDB');

class SiteContent {
    constructor(description, members, tournaments, contact, _id) {
        this.description = description;
        this.members = members;
        this.tournaments = tournaments;
        this.contact = contact;
        this._id = _id;
    }

    static async getSiteContent(id) {
        return await ProxyDb.loadObject(this, id);
    }

    static async updateSiteContent(siteContent) {
        return await ProxyDb.saveObject(this, siteContent);
    }

    static async createSiteContent(siteContent) {
        return await ProxyDb.saveObject(this, siteContent);
    }

    toMap() {
        return {
            description: this.description,
            members: this.members,
            tournaments: this.tournaments,
            contact: this.contact
        }
    }

    static fromMap(map) {
        return new SiteContent(map.description, map.members, map.tournaments, map.contact, map._id);
    }
}