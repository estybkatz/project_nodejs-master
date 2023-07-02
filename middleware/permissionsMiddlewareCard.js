const CustomError = require("../utils/CustomError");
const { getCardById } = require("../model/cardsService/cardsService");
const { logErrorToFile } = require("../utils/fileLogger");
/*
    TODO:
        finish isBizSpecific
*/

const checkIfOwner = async (iduser, idcard, res, next) => {
  try {
    //! joi the idcard
    const cardData = await getCardById(idcard);
    if (!cardData) {
      return res.status(400).json({ msg: "card not found" });
    }
    if (cardData.user_id == iduser) {
      next();
    } else {
      logErrorToFile("you are not the owner", 401);
      res.status(401).json({ msg: "you are not the  owner" });
      console.log(iduser, idcard);
    }
  } catch (err) {
    logErrorToFile(err, 400);
    res.status(400).json(err);
  }
};

/*
  isBiz = every biz
  isAdmin = is admin
  isBizOwner = biz owner
*/

const permissionsMiddleware = (isBiz, isAdmin, isOwner) => {
  return (req, res, next) => {
    //console.log(req.userData, isBiz, isAdmin, isOwner);
    if (!req.userData) {
      logErrorToFile("must provide userData", 401);

      throw new CustomError("must provide userData");
    }
    if (isBiz === req.userData.isBusiness && isBiz === true) {
      return next();
    }
    if (isAdmin === req.userData.isAdmin && isAdmin === true) {
      return next();
    }
    if (isOwner === true) {
      return checkIfOwner(req.userData._id, req.params.id, res, next);
    }
    logErrorToFile("you not allowed to edit or create", 403);
    res.status(403).json({ msg: "you not allowed to edit or create" });
  };
};

module.exports = permissionsMiddleware;
