const ProxyDb = require("../config/connector/ProxyDB");
const SiteContentSchema = require("../schemas/siteContent");

class SiteContent {
  constructor(aboutUs, members, contact, _id) {
    this.aboutUs = aboutUs;
    this.members = members;
    this.contact = contact;
    this._id = _id;
  }

  static async getSiteContent() {
    return await ProxyDb.loadObjects(SiteContentSchema);
  }

  async updateSiteContent() {
    return await ProxyDb.saveObject(SiteContentSchema, this.toMap());
  }

  async save() {
    return await ProxyDb.saveObject(SiteContentSchema, this.toMap());
  }

  toMap() {
    return {
      aboutUs: this.aboutUs,
      members: this.members,
      contact: this.contact,
      _id: this._id,
    };
  }

  static fromMap(map) {
    return new SiteContent(map.aboutUs, map.members, map.contact, map._id);
  }
}

module.exports = SiteContent;
