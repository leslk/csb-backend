const ProxyDb = require("../config/connector/ProxyDB");
const SiteContentSchema = require("../schemas/siteContent");

/**
 * @class SiteContent
 * @description SiteContent class
 * @param {String} aboutUs
 * @param {Array} members
 * @param {Object} contact
 */
class SiteContent {
  constructor(aboutUs, members, contact, _id) {
    this.aboutUs = aboutUs;
    this.members = members;
    this.contact = contact;
    this._id = _id;
  }

  // Get the site content
  static async getSiteContent() {
    return await ProxyDb.loadObjects(SiteContentSchema);
  }

  // Update the site content
  async updateSiteContent() {
    return await ProxyDb.saveObject(SiteContentSchema, this.toMap());
  }

  // Save the site content in the database
  async save() {
    return await ProxyDb.saveObject(SiteContentSchema, this.toMap());
  }

  // Convert the site content to an object
  toMap() {
    return {
      aboutUs: this.aboutUs,
      members: this.members,
      contact: this.contact,
      _id: this._id,
    };
  }

  // Convert the site content to a new instance of SiteContent
  static fromMap(map) {
    return new SiteContent(map.aboutUs, map.members, map.contact, map._id);
  }
}

module.exports = SiteContent;
