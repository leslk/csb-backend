/**
 * @class ErrorHandler
 * @description Custom error handler class
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 */

class ErrorHandler {
    constructor(status, message) {
      this.status = status;
      this.message = message;
    }
  
    // Send the error response
    send(res) {
      return res.status(this.status || 500).json({
        error: {
          status: this.status,
          message: this.message,
        },
      });
    }
  }

module.exports = ErrorHandler;