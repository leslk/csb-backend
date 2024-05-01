const SiteContent = require("../models/siteContent");
const ErrorHandler = require("../models/errorHandler");

exports.getSiteContent = async (req, res, next) => {
  try {
    const siteContent = await SiteContent.getSiteContent();
    res.json(siteContent);
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};

exports.createSiteContent = async (req, res, next) => {
  try {
    const siteContent = new SiteContent(
      req.body.aboutUs,
      req.body.members,
      req.body.contact
    );
    const createdSiteContent = await siteContent.save();
    res.status(201).json(createdSiteContent);
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};

exports.updateSiteContent = async (req, res, next) => {
  try {
    const siteContent = new SiteContent(
      req.body.aboutUs,
      req.body.members,
      req.body.contact,
      req.body._id
    );
    await siteContent.updateSiteContent(siteContent);
    res.status(200).json({ message: "Site content updated!" });
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};
