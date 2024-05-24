const SiteContent = require("../models/siteContent");
const ErrorHandler = require("../models/errorHandler");

/**
 * @controller getSiteContent
 * @description Get the site content
 */
exports.getSiteContent = async (req, res, next) => {
  try {
    // Get the site content
    const siteContent = await SiteContent.getSiteContent();
    res.json(siteContent);
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};

/**
 * @controller createSiteContent
 * @description Create the site content
 */
exports.createSiteContent = async (req, res, next) => {
  try {
    // Create the site content
    const siteContent = new SiteContent(
      req.body.aboutUs,
      req.body.members,
      req.body.contact
    );
    // Save the site content in the database
    const createdSiteContent = await siteContent.save();
    res.status(201).json(createdSiteContent);
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};

/**
 * @controller updateSiteContent
 * @description Update the site content
 */
exports.updateSiteContent = async (req, res, next) => {
  try {
    // create new instance of site content
    const siteContent = new SiteContent(
      req.body.aboutUs,
      req.body.members,
      req.body.contact,
      req.body._id
    );
    // Update the site content
    await siteContent.updateSiteContent(siteContent);
    res.status(200).json({ message: "Site content updated!" });
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};
