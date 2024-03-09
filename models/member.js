const ProxyDb = require('./config/connector/ProxyDB');

class Member {
    constructor(fristName, lastName, image, _id) {
        this.fristName = fristName;
        this.lastName = lastName;
        this.image = image;
        this._id = _id;
    }

    async createMember(member) {
        return await ProxyDb.saveObject(this, member);
    }

    async getMembers(id) {
        return await ProxyDb.loadObjects(this);
    }

    async deleteMember(id) {
        return await ProxyDb.deleteObject(this, id);
    }

    async updateMember(member) {
        return await ProxyDb.saveObject(this, member);
    }

    toMap() {
        return {
            fristName: this.fristName,
            lastName: this.lastName,
            image: this.image
        }
    }

    static fromMap(map) {
        return new Member(map.fristName, map.lastName, map.image, map._id);
    }
}