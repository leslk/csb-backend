const ProxyDb = require('./config/connector/ProxyDB');

class Payment {
    constructor(data, _id) {
        this.data = data;
        this._id = _id;
    }

    async getPayments() {
        return await ProxyDb.loadObjects(this);
    }

    async getPayment(id) {
        return await ProxyDb.loadObject(this, id);
    }
}