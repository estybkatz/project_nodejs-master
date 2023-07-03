const { verifyToken } = require("../utils/token/tokenService");
const CustomError = require("../utils/CustomError");
const { logErrorToFile } = require("../utils/fileLogger");

const authMiddleware = async (req, res, next) => {
  try {
    if (!req.headers["x-auth-token"]) {
      throw new CustomError("please provide token");
    }

    const userData = await verifyToken(req.headers["x-auth-token"]);
    req.userData = userData;

    next();
  } catch (err) {
    let errToSend;
    if (err instanceof CustomError) {
      errToSend = err;
    } else {
      errToSend = new CustomError("invalid token");
    }
    logErrorToFile(errToSend.msg, 401);

    res.status(401).json(errToSend);
  }
};
module.exports = authMiddleware;
