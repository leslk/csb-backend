
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../models/errorHandler");


module.exports = async (req, res, next) => {

    try {
        if (!req.url.includes("login") && !req.url.includes("signup") && !req.url.includes("password/create")) {
            const token = req.cookies.token;
            if (!token) throw { status: 401, message: "NO_TOKEN" };
            const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET, { algorithm: 'HS256' });      
            const id = decodedToken._id;
            const admin = await Admin.findById(id);
    
            if ((admin && admin._id != id) || (id && admin.id != id)) {
                throw {
                    status: 401,
                    message: "TOKEN_ID_NOT_MATCHING_USER_ID"
                };
            }
        }
        next();
    } catch (error) {
        const errorHandler = new ErrorHandler(error.status, error.message);
        return errorHandler.send(res);
    }
}