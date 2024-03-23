const ProxyDb = require('./config/connector/ProxyDB');

class Tournament {
    constructor(location, availablePlaces, reservedPlaces, participants, startDate, description, status, tournamentHistory, _id) {
        this.location = location,
        this.availablePlaces = availablePlaces, 
        this.reservedPlaces = reservedPlaces,
        this.participants = participants,
        this.startDate = startDate,
        this.decsription = description,
        this.status = status,
        this.tournamentHistory = tournamentHistory,
        this._id = _id
    }

    async createTournament(tournament) {
        return await ProxyDb.saveObject(this, tournament);
    }

    static async getTournaments(id) {
        return await ProxyDb.loadObjects(this);
    }

    static async getTournament(id) {
        return await ProxyDb.loadObject(this, id);
    }

    async deleteTournament(id) {
        return await ProxyDb.deleteObject(this, id);
    }

    async updateTournament(tournament) {
        return await ProxyDb.saveObject(this, tournament);
    }

    toMap() {
        return {
            location: this.location,
            availablePlaces: this.availablePlaces,
            reservedPlaces: this.reservedPlaces,
            participants: this.participants,
            startDate: this.startDate,
            description: this.description,
            status: this.status,
            tournamentHistory: this.tournamentHistory
        }
    }

    static fromMap(map) {
        return new Tournament(map.location, map.availablePlaces, map.reservedPlaces, map.participants, map.startDate, map.description, map.status, map.tournamentHistory, map._id);
    }
}

module.exports = Tournament;