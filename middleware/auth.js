const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../models/errorHandler");

/**
 * @middleware auth
 * @description Check if the user is authenticated
 */
module.exports = async (req, res, next) => {
  try {
    // Get the token from the cookies
    const token = req.cookies.token;
    // Check if the token exists
    if (!token) throw { status: 401, message: "NO_TOKEN" };
    // Verify the token
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
    });
    // Get the id from the token
    const id = decodedToken._id;
    // Check if the user exists in the database by the id
    const admin = await Admin.findById(id);
    // Check if the admin id from the token matches the user id find in the database 
    // and throw an error if it doesn't match
    if ((admin && admin._id != id) || (id && admin._id != id)) {
      throw {
        status: 401,
        message: "TOKEN_ID_NOT_MATCHING_USER_ID",
      };
    }
    // the next() function allows the request to continue to the next middleware function
    next();
  } catch (error) {
    const errorHandler = new ErrorHandler(error.status, error.message);
    return errorHandler.send(res);
  }
};
