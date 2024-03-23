const MongoDbConnector = require("./mongoDbConnector");

class ProxyDb {
  db = null;

  getInstance() {
    if (this.db === null) {
      this.db = MongoDbConnector.getInstance();
    }
    return this.db;
  }

  loadObjects(className, filter) {
    this.getInstance();
    return this.db.loadObjects(className, filter);
  }

  loadObject(className, id) {
    this.getInstance();
    return this.db.loadObject(className, id);
  }

  searchObject(schema, filter) {
    this.getInstance();
    return this.db.searchObject(schema, filter);
  }

  saveObject(schema, object) {
    this.getInstance();
    return this.db.saveObject(schema, object);
  }

  deleteObject(className, id) {
    this.getInstance();
    return this.db.deleteObject(className, id);
  }

  insertObject(object) {
    this.getInstance();
    return this.db.insertObject(object);
  }
}

module.exports = new ProxyDb();
