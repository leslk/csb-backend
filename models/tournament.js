const ProxyDb = require("../config/connector/ProxyDB");
const TournamentSchema = require("../schemas/tournament");

/**
 * @class Tournament
 * @description Tournament class
 * @param {String} address
 * @param {String} city
 * @param {String} zipCode
 * @param {Number} availablePlaces
 * @param {Array} participants
 * @param {Date} startDate
 * @param {String} description
 * @param {String} status
 * @param {Object} tournamentHistory
 * @param {Number} price
 * @param {String} _id
 */
class Tournament {
  constructor(
    address,
    city,
    zipCode,
    availablePlaces,
    participants,
    startDate,
    description,
    status,
    tournamentHistory,
    price,
    _id
  ) {
      (this.address = address),
      (this.city = city),
      (this.zipCode = zipCode),
      (this.availablePlaces = availablePlaces),
      (this.participants = participants),
      (this.startDate = startDate),
      (this.description = description),
      (this.status = status),
      (this.tournamentHistory = tournamentHistory),
      (this.price = price),
      (this._id = _id);
  }

  // Save the tournament in the database
  async save() {
    return await ProxyDb.saveObject(TournamentSchema, this.toMap());
  }

  // Create the tournament history
  async createTournament(tournament) {
    return await ProxyDb.saveObject(TournamentSchema, tournament);
  }

  // Find tournament by id
  static async findById(id) {
    return await ProxyDb.loadObject(TournamentSchema, id);
  }

  // Get all tournaments
  static async getTournaments() {
    return await ProxyDb.loadObjects(TournamentSchema);
  }

  // Get tournament by id
  static async getTournament(id) {
    return await ProxyDb.loadObject(TournamentSchema, id);
  }

  // Update the tournament status
  static async updateStatus(id, status) {
    return await ProxyDb.saveObject(TournamentSchema, {
      _id: id,
      status: status,
    });
  }

  // Delete the tournament
  async deleteTournament(id) {
    return await ProxyDb.deleteObject(this, id);
  }

  // Update the tournament
  async updateTournament() {
    const tournament = this.toMap();
    return await ProxyDb.saveObject(TournamentSchema, tournament);
  }

  // Convert the tournament to an object
  toMap() {
    return {
      address: this.address,
      city: this.city,
      zipCode: this.zipCode,
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

  // Convert the tournament to a new instance of Tournament
  static fromMap(map) {
    return new Tournament(
      map.address,
      map.city,
      map.zipCode,
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
