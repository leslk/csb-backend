class ErrorHandler {
    constructor(status, message) {
      this.status = status;
      this.message = message;
    }
  
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