const CustomError = require("../utils/CustomError");
const { getUserdById } = require("../model/usersService/usersService");
const { verifyToken } = require("../utils/token/jwt");
const jwt = require("jsonwebtoken");
const { logErrorToFile } = require("../utils/fileLogger");

/*
  isBiz = every biz
  isAdmin = is admin
  isBizOwner = biz owner
*/

const permissionsMiddlewareUser = (isBiz, isAdmin, isOwner) => {
  return (req, res, next) => {
    if (!req.userData) {
      logErrorToFile("did not provide userData", 400);
      throw new CustomError("must provide userData");
    }
    if (isBiz === req.userData.isBusiness && isBiz === true) {
      return next();
    }
    if (isAdmin === req.userData.isAdmin && isAdmin === true) {
      return next();
    }

    if (req.params.id === req.userData._id && isOwner === true) {
      return next();
    }

    logErrorToFile(
      "you do not have sufficient permissions for this action",
      403
    );
    res
      .status(403)
      .json({ msg: "you do not have sufficient permissions for this action" });
  };
};

module.exports = permissionsMiddlewareUser;
