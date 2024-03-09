const ProxyDb = require('./config/connector/ProxyDB');

class TournamentHistory {
    constructor(content, images, _id) {
        this.content = content;
        this.images = images;
        this._id = _id;
    }

    static async getTournamentHistory(id) {
        return await ProxyDb.loadObject(this, id);
    }

    static async updateTournamentHistory(tournamentHistory) {
        return await ProxyDb.saveObject(this, tournamentHistory);
    }

    static async createTournamentHistory(tournamentHistory) {
        return await ProxyDb.saveObject(this, tournamentHistory);
    }

    async deleteTournamentHistory(id) {
        return await ProxyDb.deleteObject(this, id);
    }

    toMap() {
        return {
            content: this.content,
            images: this.images
        }
    }

    static fromMap(map) {
        return new TournamentHistory(map.content, map.images, map._id);
    }
}