const CustomError = require("../utils/CustomError");
const { getUserdById } = require("../model/usersService/usersService");
const { verifyToken } = require("../utils/token/jwt");
const jwt = require("jsonwebtoken");
const { logErrorToFile } = require("../utils/fileLogger");
//const checkIfOwner = async (req, res, next, iduser) => {
//   try {
//     // ! joi the iduser
//     const UserData = await getUserdById(iduser);
//     // console.log(UserData);
//     //console.log("logloglog", UserData._id, iduser, req.headers._id);
//     // next();
//     if (!UserData) {
//       return res.status(400).json({ msg: "user not found" });
//     }
//     if (UserData.id == iduser) {
//       next();
//     } else {
//       //  console.log("logloglog", UserData._id, iduser);
//       res.status(401).json({ msg: "you not the owner" });
//     }
//   } catch (err) {
//     res.status(400).json(err);
//   }
// };

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
    // if (!(req.params.id === jwt.decode(req.rawHeaders[1])._id)) {
    //   res.status(401).json({ msg: "you are not the owner" });
    // }

    if (req.params.id === req.userData._id && isOwner === true) {
      return next();
      //console.log("hello");
      //return checkIfOwner(req, res, next, req.params.id);
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
//verifyToken(req.rawHeaders[1])._id
