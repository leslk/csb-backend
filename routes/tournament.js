const express = require("express");
const router = express.Router();

const tournamentCtrl = require("../controllers/tournament");
const auth = require("../middleware/auth");

router.post("/", auth, tournamentCtrl.createTournament);
router.get("/", tournamentCtrl.getTournaments);
router.put("/:id", auth, tournamentCtrl.updateTournament);
router.put(
  "/:id/tournamentHistory",
  auth,
  tournamentCtrl.updateTournamentHistory
);
router.put("/:id/participants", auth, tournamentCtrl.updateParticipants);
router.delete(
  "/:id/participants/:participantId",
  auth,
  tournamentCtrl.deleteParticipant
);

module.exports = router;
