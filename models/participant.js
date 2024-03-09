const ProxyDb = require('./config/connector/ProxyDB');

class Participant {
    constructor(firstName, lastName, phoneNumber, _id) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this._id = _id;
    }

    async createParticipant(participant) {
        return await ProxyDb.saveObject(this, participant);
    }

    async getParticipants(id) {
        return await ProxyDb.loadObjects(this);
    }

    async deleteParticipant(id) {
        return await ProxyDb.deleteObject(this, id);
    }

    toMap() {
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            phoneNumber: this.phoneNumber
        }
    }

    static fromMap(map) {
        return new Participant(map.firstName, map.lastName, map.phoneNumber, map._id);
    }

    //Add sendConfirmation

    //Add sendDeletionConfirmation
}

