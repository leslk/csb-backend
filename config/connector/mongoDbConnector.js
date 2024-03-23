const DbConnector = require("./dbConnector");

class MongoDbConnector extends DbConnector {
  static instance = null;
  constructor() {
    super();
    this.connection = require("../database/mongoDbDatabase").databaseConnection;
  }

  static getInstance() {
    if (this.instance === null) {
      this.instance = new MongoDbConnector();
    }
    return this.instance;
  }

  async searchObject(schema, filter) {
    const obj = await schema.findOne(filter);
    return obj;
  }
  async saveObject(schema, object) {
    if (!object._id) {
      return await this.insertObject(schema, object);
    } else {
      return await this.updateObject(schema, object);
    }
  }

  async insertObject(schema, object) {
    delete object._id;
    const obj = new schema(object);
    const newObj = await obj.save();
    return newObj;
  }

  async updateObject(schema, object) {
    const updatedObj = await schema.findOneAndUpdate(
      { _id: object._id },
      { $set: { ...object } },
      { new: true }
    );
    return updatedObj;
  }
  async deleteObject(schema, id) {
    return schema.deleteOne({ _id: id });
  }
  async loadObject(schema, id) {
    return schema.findOne({ _id: id });
  }
  async loadObjects(schema) {
    return schema.find();
  }
}

module.exports = MongoDbConnector;
