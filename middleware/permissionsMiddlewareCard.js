const CustomError = require("../utils/CustomError");
const { getCardById } = require("../model/cardsService/cardsService");
const { logErrorToFile } = require("../utils/fileLogger");
const joiValidation = require("../validation/joi/idValidation");
const checkIfOwner = async (iduser, idcard, res, next) => {
  try {
    await joiValidation.validateIdSchema(idcard);
    const cardData = await getCardById(idcard);
    if (!cardData) {
      logErrorToFile("card not found", 404);
      return res.status(404).json({ msg: "card not found" });
    }
    if (cardData.user_id == iduser) {
      next();
    } else {
      logErrorToFile("you are not the owner", 401);
      res.status(401).json({ msg: "you are not the  owner" });
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
    if (!req.userData.isBusiness) {
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
