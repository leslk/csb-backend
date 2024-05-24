const ErrorHandler = require("../models/errorHandler");
const Tournament = require("../models/tournament");
const path = require("path");
const hbs = require("nodemailer-express-handlebars");
const logoPath = path.join(__dirname, "../assets/csb_logo_letter.png");
const fs = require("fs");
const nodemailer = require("nodemailer");
const moment = require("moment");
require("moment/locale/fr");
moment.locale("fr");

/**
 * @controller createTournament
 * @description Create a tournament
 */
exports.createTournament = async (req, res) => {
  const tournamentData = req.body;
  // Check if start date is in the future
  if (Date.now() > new Date(tournamentData.startDate)) {
    return new ErrorHandler(400, "Start date must be in the future").send(res);
  }
  // Check if available places is a minimum of 2
  if (tournamentData.availablePlaces < 2) {
    return new ErrorHandler(400, "Available places must be at least 2").send(
      res
    );
  }
  // Check if available places is 16 max
  if (tournamentData.availablePlaces > 16) {
    return new ErrorHandler(400, "Available places must be at most 16").send(
      res
    );
  }

  // Create the tournament object in DB
  const tournament = new Tournament(
    tournamentData.address,
    tournamentData.city,
    tournamentData.zipCode,
    tournamentData.availablePlaces,
    [],
    tournamentData.startDate,
    tournamentData.description,
    "open",
    { title: null, content: null, images: [] },
    tournamentData.price
  );

  try {
    // Save the tournament in the database
    const createdTournament = await tournament.save();
    res.status(201).json(createdTournament);
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};

/**
 * @controller updateTournamentHistory
 * @description Update the tournament history 
 */
exports.updateTournamentHistory = async (req, res) => {
  try {
    // find the tournament by id
    let tournament = Tournament.fromMap(
      await Tournament.findById(req.params.id)
    );

    // Check for new / deleted images
    let images = tournament.tournamentHistory.images;
    if (req.body.images) {
      // Check if new images has been added (add them in db)
      for (const image of req.body.images) {
        if (!tournament.tournamentHistory.images.includes(image)) {
          images.push(image);
        }
      }

      // Check if images have been deleted (if they are missing from body)
      for (const image of tournament.tournamentHistory.images) {
        if (!req.body.images.includes(image)) {
          // Remove image from object
          images = images.filter((img) => img !== image);

          // Delete image from db
          fs.unlink(`images/${image}`, (error) => {
            if (error) {
              return new ErrorHandler(
                500,
                "Erreur lors de la suppression du fichier"
              );
            }
          });
        }
      }
    }

    // Update tournament history data
    tournament.tournamentHistory = {
      title: req.body.title || tournament.tournamentHistory.title,
      content: req.body.content || tournament.tournamentHistory.content,
      images: images,
    };

    // Save to db
    const updatedTournament = await tournament.updateTournament();
    return res.status(200).json(updatedTournament);
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};

/**
 * @controller getTournaments
 * @description Get all tournaments
 */
exports.getTournaments = async (req, res) => {
  try {
    // Get all tournaments
    const tournaments = await Tournament.getTournaments();
    // Check if the tournament is open or closed
    const actualDate = new Date();
    for (let i = 0; i < tournaments.length; i++) {
      const tournamentDate = new Date(tournaments[i].startDate);
      if (tournamentDate < actualDate && tournaments[i].status === "open") {
        // if the tournament date is passed and the status is open, close the tournament
        Tournament.updateStatus(tournaments[i]._id, "closed");
      }
    }
    // Get all tournaments to send in response
    const updatedTournaments = await Tournament.getTournaments();
    res.status(200).json(updatedTournaments);
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};

/**
 * @controller getTournament
 * @description Get a tournament by id 
 */
exports.getTournament = async (req, res) => {
  try {
    // Get the tournament by id
    const tournament = await Tournament.getTournament(req.params.id);
    res.status(200).json(tournament);
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
}

/**
 * @controller updateTournament
 * @description Update a tournament by id 
 */
exports.updateTournament = async (req, res) => {
  try {
    // Get the tournament by id
    const DBtournament = await Tournament.findById(req.params.id);
    // Check if start date is in the future
    if (req.body.startDate) {
      if (Date.now() > new Date(req.body.startDate)) {
        return new ErrorHandler(400, "Start date must be in the future").send(
          res
        );
      }
    }
    // Check if available places is a minimum of 2
    if (req.body.availablePlaces) {
      if (req.body.availablePlaces < 2) {
        return new ErrorHandler(
          400,
          "Available places must be at least 2"
        ).send(res);
      }
      // Check if available places is 16 max
      if (req.body.availablePlaces > 16) {
        return new ErrorHandler(
          400,
          "Available places must be at most 16"
        ).send(res);
      }
    }
    // Check if the date or location has changed
    const isDateAsChanged =
      new Date(req.body.startDate).getTime() !==
      new Date(DBtournament.startDate).getTime();
    const isLocationAsChanged = req.body.address !== DBtournament.address || req.body.city !== DBtournament.city || req.body.zipCode !== DBtournament.zipCode;
    // Send an email to all participants if the date or location has changed
    if (isDateAsChanged || isLocationAsChanged) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
      });
      const handlebarOptions = {
        viewEngine: {
          partialsDir: path.resolve("./views/"),
          defaultLayout: false,
        },
        viewPath: path.resolve("./views/"),
      };
      for (let i = 0; i < DBtournament.participants.length; i++) {
        const mailOptions = {
          from: process.env.EMAIL,
          to: DBtournament.participants[i].email,
          subject: "Modification de tournoi Caen street Ball",
          template: "tournamentUpdateTemplate",
          context: {
            firstName: DBtournament.participants[i].firstName,
            lastName: DBtournament.participants[i].lastName,
            address: DBtournament.address,
            city: DBtournament.city,
            zipCode: DBtournament.zipCode,
            date: moment(DBtournament.startDate).format("DD MMMM YYYY à HH:mm"),
            newAddress: req.body.address,
            newCity: req.body.city,
            newZipCode: req.body.zipCode,
            newDate: moment(req.body.startDate).format("DD MMMM YYYY à HH:mm"),
          },
          attachments: [
            {
              filename: "csb_logo_letter.png",
              path: logoPath,
              cid: "Logo",
            },
          ],
        };
        transporter.use("compile", hbs(handlebarOptions));
        try {
          await transporter.sendMail(mailOptions);
        } catch (err) {
          throw {
            status: 500,
            message: {
              error: "NODEMAILER_ERROR",
              message: err,
            },
          };
        }
      }
    }
    // Send an email to all participants if the tournament is cancelled
    if (req.body.status === "cancelled") {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
      });
      const handlebarOptions = {
        viewEngine: {
          partialsDir: path.resolve("./views/"),
          defaultLayout: false,
        },
        viewPath: path.resolve("./views/"),
      };
      for (let i = 0; i < DBtournament.participants.length; i++) {
        const mailOptions = {
          from: process.env.EMAIL,
          to: DBtournament.participants[i].email,
          subject: "Annulation de tournoi Caen street Ball",
          template: "tournamentCancelled",
          context: {
            firstName: DBtournament.participants[i].firstName,
            lastName: DBtournament.participants[i].lastName,
            address: DBtournament.address,
            city: DBtournament.city,
            zipCode: DBtournament.zipCode,
            date: moment(DBtournament.startDate).format("DD MMMM YYYY à HH:mm"),
          },
          attachments: [
            {
              filename: "csb_logo_letter.png",
              path: logoPath,
              cid: "Logo",
            },
          ],
        };
        transporter.use("compile", hbs(handlebarOptions));
        try {
          await transporter.sendMail(mailOptions);
        } catch (err) {
          throw {
            status: 500,
            message: {
              error: "NODEMAILER_ERROR",
              message: err,
            },
          };
        }
      }
    }
    // create a new tournament object with the new data
    const tournament = new Tournament(
      req.body.address || DBtournament.address,
      req.body.city || DBtournament.city,
      req.body.zipCode || DBtournament.zipCode,
      req.body.availablePlaces || DBtournament.availablePlaces,
      req.body.participants || DBtournament.participants,
      req.body.startDate || DBtournament.startDate,
      req.body.description || DBtournament.description,
      req.body.status || DBtournament.status,
      req.body.tournamentHistory || DBtournament.tournamentHistory,
      req.body.price || DBtournament.price,
      req.params.id
    );
    // Update the tournament
    const updatedTournament = await tournament.updateTournament();
    return res.status(200).json(updatedTournament);
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};

/**
 * @controller updateParticipants
 * @description Update the participants of a tournament
 */
exports.updateParticipants = async (req, res) => {
  try {
    // Get the tournament by id
    const tournament = Tournament.fromMap(
      await Tournament.findById(req.params.id)
    );
    // Check if the tournament is closed
    if (tournament.status === "closed") {
      return new ErrorHandler(400, "Tournament is closed").send(res);
    }
    // Check if the tournament is full
    if (tournament.availablePlaces === tournament.participants.length) {
      return new ErrorHandler(400, "No more available places").send(res);
    }
    // get the participant from the request body
    const participant = req.body;
    // send an email to the participant
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
    });
    const handlebarOptions = {
      viewEngine: {
        partialsDir: path.resolve("./views/"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./views/"),
    };
    const mailOptions = {
      from: process.env.EMAIL,
      to: participant.email,
      subject: "Inscription tournoi Caen street Ball",
      template: "tournamentParticipant",
      context: {
        firstName: participant.firstName,
        lastName: participant.lastName,
        address: tournament.address,
        address: tournament.address,
        city: tournament.city,
        zipCode: tournament.zipCode,
        date: moment(tournament.startDate).format("DD MMMM YYYY à HH:mm"),
      },
      attachments: [
        {
          filename: "csb_logo_letter.png",
          path: logoPath,
          cid: "Logo",
        },
      ],
    };
    transporter.use("compile", hbs(handlebarOptions));
    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      throw {
        status: 500,
        message: {
          error: "NODEMAILER_ERROR",
          message: err,
        },
      };
    }
    // add the participant to the tournament
    tournament.participants.push(participant);
    // update the tournament
    const updatedTournament = await tournament.updateTournament();
    return res.status(200).json(updatedTournament);
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};

/**
 * @controller deleteParticipant
 * @description Delete a participant from a tournament 
 */
exports.deleteParticipant = async (req, res) => {
  try {
    // Get the tournament by id
    const tournament = Tournament.fromMap(
      await Tournament.findById(req.params.id)
    );
    // Check if the tournament is closed
    if (tournament.status === "closed") {
      return new ErrorHandler(400, "Tournament is closed").send(res);
    }
    // Check if the participant exists
    const participantToDelete = tournament.participants.find(
      (participant) => participant._id == req.params.participantId
    );
    // if the participant does not exist, return an error
    if (!participantToDelete) {
      return new ErrorHandler(404, "Participant not found").send(res);
    }
    // send an email to the participant
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
    });
    const handlebarOptions = {
      viewEngine: {
        partialsDir: path.resolve("./views/"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./views/"),
    };
    const mailOptions = {
      from: process.env.EMAIL,
      to: participantToDelete.email,
      subject: "Désinscription tournoi Caen street Ball",
      template: "deleteParticipantTemplate",
      context: {
        firstName: participantToDelete.firstName,
        lastName: participantToDelete.lastName,
        address: tournament.address,
        city: tournament.city,
        zipCode: tournament.zipCode,
        date: moment(tournament.startDate).format("DD MMMM YYYY à HH:mm"),
      },
      attachments: [
        {
          filename: "csb_logo_letter.png",
          path: logoPath,
          cid: "Logo",
        },
      ],
    };
    transporter.use("compile", hbs(handlebarOptions));
    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      throw {
        status: 500,
        message: {
          error: "NODEMAILER_ERROR",
          message: err,
        },
      };
    }
    // remove the participant from the tournament
    tournament.participants = tournament.participants.filter(
      (participant) => participant._id != req.params.participantId
    );
    // update the tournament
    const updatedTournament = await tournament.updateTournament();
    return res.status(200).json(updatedTournament);
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};

/**
 * @controller deleteTournament history
 * @description Delete the tournament history
 */
exports.deleteTournamentHistory = async (req, res) => {
  try {
    // Get the tournament by id
    const tournament = Tournament.fromMap(
      await Tournament.findById(req.params.id)
    );
    // remove the images from the server
    const images = tournament.tournamentHistory.images;
    for (const image of images) {
      fs.unlink(`images/${image}`, (error) => {
        if (error) {
          return new ErrorHandler(500, "Error_while_deleting_the_file");
        }
      });
    }
    // reset the tournament history
    tournament.tournamentHistory = {
      title: null,
      content: null,
      images: [],
    };
    // update the tournament
    const updatedTournament = await tournament.updateTournament();
    return res.status(200).json(updatedTournament);
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};
