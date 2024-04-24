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
    tournamentData.location,
    tournamentData.availablePlaces,
    [],
    tournamentData.startDate,
    tournamentData.description,
    "open",
    { title: null, content: null, images: [] },
    tournamentData.price
  );

  try {
    const createdTournament = await tournament.save();
    res.status(201).json(createdTournament);
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};

exports.updateTournamentHistory = async (req, res) => {
  try {
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

exports.getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.getTournaments();
    const actualDate = new Date();
    for (let i = 0; i < tournaments.length; i++) {
      const tournamentDate = new Date(tournaments[i].startDate);
      if (tournamentDate < actualDate && tournaments[i].status === "open") {
        Tournament.updateStatus(tournaments[i]._id, "closed");
      }
    }
    const updatedTournaments = await Tournament.getTournaments();
    res.status(200).json(updatedTournaments);
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};

exports.updateTournament = async (req, res) => {
  try {
    const DBtournament = await Tournament.findById(req.params.id);
    // if (req.body.startDate) {
    //   if (Date.now() > new Date(req.body.startDate)) {
    //     return new ErrorHandler(400, "Start date must be in the future").send(
    //       res
    //     );
    //   }
    // }
    if (req.body.availablePlaces) {
      if (req.body.availablePlaces < 2) {
        return new ErrorHandler(
          400,
          "Available places must be at least 2"
        ).send(res);
      }
      if (req.body.availablePlaces > 16) {
        return new ErrorHandler(
          400,
          "Available places must be at most 16"
        ).send(res);
      }
    }
    const isDateAsChanged =
      new Date(req.body.startDate).getTime() !==
      new Date(DBtournament.startDate).getTime();
    const isLocationAsChanged = req.body.location !== DBtournament.location;
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
          subject: "Modification de tournois Caen street Ball",
          template: "tournamentUpdateTemplate",
          context: {
            firstName: DBtournament.participants[i].firstName,
            lastName: DBtournament.participants[i].lastName,
            location: DBtournament.location,
            date: moment(DBtournament.startDate).format("DD MMMM YYYY à HH:mm"),
            newLocation: req.body.location,
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
          subject: "Annulation de tournois Caen street Ball",
          template: "tournamentCancelled",
          context: {
            firstName: DBtournament.participants[i].firstName,
            lastName: DBtournament.participants[i].lastName,
            location: DBtournament.location,
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
    const tournament = new Tournament(
      req.body.location || DBtournament.location,
      req.body.availablePlaces || DBtournament.availablePlaces,
      req.body.participants || DBtournament.participants,
      req.body.startDate || DBtournament.startDate,
      req.body.description || DBtournament.description,
      req.body.status || DBtournament.status,
      req.body.tournamentHistory || DBtournament.tournamentHistory,
      req.body.price || DBtournament.price,
      req.params.id
    );
    const updatedTournament = await tournament.updateTournament();
    return res.status(200).json(updatedTournament);
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};

exports.updateParticipants = async (req, res) => {
  try {
    const tournament = Tournament.fromMap(
      await Tournament.findById(req.params.id)
    );
    if (tournament.status === "closed") {
      return new ErrorHandler(400, "Tournament is closed").send(res);
    }
    if (tournament.availablePlaces === tournament.participants.length) {
      return new ErrorHandler(400, "No more available places").send(res);
    }
    const participant = req.body;
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
      subject: "Inscription tournois Caen street Ball",
      template: "tournamentParticipant",
      context: {
        firstName: participant.firstName,
        lastName: participant.lastName,
        location: tournament.location,
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
    tournament.participants.push(participant);
    const updatedTournament = await tournament.updateTournament();
    return res.status(200).json(updatedTournament);
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};

exports.deleteParticipant = async (req, res) => {
  try {
    const tournament = Tournament.fromMap(
      await Tournament.findById(req.params.id)
    );
    if (tournament.status === "closed") {
      return new ErrorHandler(400, "Tournament is closed").send(res);
    }
    const participantIndex = tournament.participants.findIndex(
      (participant) => participant._id == req.params.participantId
    );
    if (participantIndex === -1) {
      return new ErrorHandler(404, "Participant not found").send(res);
    }
    tournament.participants.splice(participantIndex, 1);
    const updatedTournament = await tournament.updateTournament();
    return res.status(200).json(updatedTournament);
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};

exports.deleteTournamentHistory = async (req, res) => {
  try {
    const tournament = Tournament.fromMap(
      await Tournament.findById(req.params.id)
    );
    const images = tournament.tournamentHistory.images;
    for (const image of images) {
      fs.unlink(`images/${image}`, (error) => {
        if (error) {
          return new ErrorHandler(500, "Error_while_deleting_the_file");
        }
      });
    }
    tournament.tournamentHistory = {
      title: null,
      content: null,
      images: [],
    };
    const updatedTournament = await tournament.updateTournament();
    return res.status(200).json(updatedTournament);
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};
