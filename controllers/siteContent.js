const SiteContent = require('../models/siteContent');
const ErrorHandler = require('../models/errorHandler');


exports.createSiteContent = async (req, res) => {
    try {
        const siteContent = new SiteContent(req.body.description);
        const newSiteContent = await siteContent.save();
        return res.status(201).json({
            message: "Site content created",
            siteContent: newSiteContent
        });
    } catch (error) {
        return new ErrorHandler(error.status, error.message).send(res);
    }
};