const ProxyDb = require("../config/connector/ProxyDB");
const TournamentSchema = require("../schemas/tournament");

class Tournament {
  constructor(
    location,
    availablePlaces,
    participants,
    startDate,
    description,
    status,
    tournamentHistory,
    price,
    _id
  ) {
    (this.location = location),
      (this.availablePlaces = availablePlaces),
      (this.participants = participants),
      (this.startDate = startDate),
      (this.description = description),
      (this.status = status),
      (this.tournamentHistory = tournamentHistory),
      (this.price = price),
      (this._id = _id);
  }

  async save() {
    try {
      return await ProxyDb.saveObject(TournamentSchema, this.toMap());
    } catch (error) {
      throw error;
    }
  }

  async createTournament(tournament) {
    return await ProxyDb.saveObject(TournamentSchema, tournament);
  }

  static async findById(id) {
    return await ProxyDb.loadObject(TournamentSchema, id);
  }

  static async getTournaments() {
    return await ProxyDb.loadObjects(TournamentSchema);
  }

  static async getTournament(id) {
    return await ProxyDb.loadObject(this, id);
  }

  static async updateStatus(id, status) {
    return await ProxyDb.saveObject(TournamentSchema, {
      _id: id,
      status: status,
    });
  }

  async deleteTournament(id) {
    return await ProxyDb.deleteObject(this, id);
  }

  async updateTournament() {
    const tournament = this.toMap();
    return await ProxyDb.saveObject(TournamentSchema, tournament);
  }

  toMap() {
    return {
      location: this.location,
      availablePlaces: this.availablePlaces,
      participants: this.participants,
      startDate: this.startDate,
      description: this.description,
      status: this.status,
      tournamentHistory: this.tournamentHistory,
      price: this.price,
      _id: this._id,
    };
  }

  static fromMap(map) {
    return new Tournament(
      map.location,
      map.availablePlaces,
      map.participants,
      map.startDate,
      map.description,
      map.status,
      map.tournamentHistory,
      map.price,
      map._id
    );
  }
}

module.exports = Tournament;
