const DbConnector = require("./dbConnector");

/**
 * @class MongoDbConnector
 * @description This class is a connector for MongoDB.
 * @extends DbConnector
 * The singleton pattern is used to ensure that only one instance of the class is created.
 */

class MongoDbConnector extends DbConnector {
  static instance = null;
  constructor() {
    super();
    this.connection = require("../database/mongoDbDatabase").databaseConnection;
  }

  // Singleton pattern
  static getInstance() {
    if (this.instance === null) {
      this.instance = new MongoDbConnector();
    }
    return this.instance;
  }

  // search object in the database
  async searchObject(schema, filter) {
    const obj = await schema.findOne(filter);
    return obj;
  }

  // save object in the database
  // if the object has an id, update it, otherwise insert it
  async saveObject(schema, object) {
    if (!object._id) {
      return await this.insertObject(schema, object);
    } else {
      return await this.updateObject(schema, object);
    }
  }

  // insert object in the database
  async insertObject(schema, object) {
    delete object._id;
    const obj = new schema(object);
    const newObj = await obj.save();
    return newObj;
  }

  // update object in the database
  async updateObject(schema, object) {
    const updatedObj = await schema.findOneAndUpdate(
      { _id: object._id },
      { $set: { ...object } },
      { new: true }
    );
    return updatedObj;
  }

  // delete object from the database
  async deleteObject(schema, id) {
    return schema.deleteOne({ _id: id });
  }

  // load object from the database
  async loadObject(schema, id) {
    return schema.findOne({ _id: id });
  }

  // load objects from the database
  async loadObjects(schema) {
    return schema.find();
  }
}

module.exports = MongoDbConnector;
