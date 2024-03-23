const Contact = require("../models/contact");
const ErrorHandler = require("../models/errorHandler");

exports.createContact = async (req, res) => {
  try {
    // TO DO push contact id in the site content
    const contact = new Contact(
      req.body.email,
      req.body.phoneNumber,
      req.body.facebookLink,
      req.body.instagramLink
    );
    const newContact = await contact.save();
    return res.status(201).json({
      message: "Contact created",
      contact: newContact,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.getContact();
    return res.status(200).json({
      message: "Contact found",
      contact: contact,
    });
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};

exports.updateContact = async (req, res) => {
  try {
    const contact = new Contact(
      req.body.email,
      req.body.phoneNumber,
      req.body.facebookLink,
      req.body.instagramLink,
      req.body._id
    );
    const updatedContact = await contact.updateContact();
    return res.status(200).json({
      message: "Contact updated",
      contact: updatedContact,
    });
  } catch (error) {
    return new ErrorHandler(error.status, error.message).send(res);
  }
};
