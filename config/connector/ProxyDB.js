const MongoDbConnector = require("./mongoDbConnector");

/**
 * ProxyDb class
 * @description ProxyDb class
 * @class ProxyDb
 * @param {Object} db
 */
class ProxyDb {
  db = null;

  // Singleton pattern
  getInstance() {
    if (this.db === null) {
      this.db = MongoDbConnector.getInstance();
    }
    return this.db;
  }

  // load objects from the database
  loadObjects(className, filter) {
    this.getInstance();
    return this.db.loadObjects(className, filter);
  }

  // load object from the database
  loadObject(className, id) {
    this.getInstance();
    return this.db.loadObject(className, id);
  }

  // search object in the database
  searchObject(schema, filter) {
    this.getInstance();
    return this.db.searchObject(schema, filter);
  }

  // save object in the database
  saveObject(schema, object) {
    this.getInstance();
    return this.db.saveObject(schema, object);
  }

  // update object in the database
  deleteObject(className, id) {
    this.getInstance();
    return this.db.deleteObject(className, id);
  }

  // insert object in the database
  insertObject(object) {
    this.getInstance();
    return this.db.insertObject(object);
  }
}

module.exports = new ProxyDb();
