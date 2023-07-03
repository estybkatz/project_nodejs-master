const express = require("express");
const router = express.Router();
const cardsServiceModel = require("../../model/cardsService/cardsService");
const normalizeCard = require("../../model/cardsService/helpers/normalizationCardService");
const cardsValidationService = require("../../validation/cardsValidationService");
const permissionsMiddleware = require("../../middleware/permissionsMiddlewareCard");
const authmw = require("../../middleware/authMiddleware");
const CustomError = require("../../utils/CustomError");
const { getUserdById } = "../../model/usersService/usersService";
const permissionsMiddlewareUser = require("../../middleware/permissionsMiddlewareUser");
const { logErrorToFile } = require("../../utils/fileLogger");

//סעיף 1
// get all cards all
//http://localhost:8181/api/cards
router.get("/", async (req, res) => {
  try {
    const allCards = await cardsServiceModel.getAllCards();
    res.json(allCards);
  } catch (err) {
    logErrorToFile(err.msg, 400);
    res.status(400).json(err);
  }
});
//סעיף 2
//my cards, registered
//http://localhost:8181/api/cards/my-cards
router.get(
  "/my-cards",
  authmw,

  async (req, res) => {
    try {
      const Cards = await cardsServiceModel.getAllCards();
      const myCards = Cards.filter((card) => card.user_id == req.userData._id);
      if (myCards.length) res.json(myCards);
      else {
        res.status(200).json("You do not have cards");
      }
    } catch (err) {
      console.log("err", err);
      logErrorToFile(err.msg, 400);
      res.status(400).json(err);
    }
  }
);

//סעיף 3
// all
//http://localhost:8181/api/cards/:id
router.get("/:id", async (req, res) => {
  try {
    await cardsValidationService.idUserValidation(req.params.id);
    const cardFromDB = await cardsServiceModel.getCardById(req.params.id);
    if (!cardFromDB) throw new CustomError("There exists no card with the id");
    res.json(cardFromDB);
  } catch (err) {
    if (err instanceof CustomError) logErrorToFile(err.msg, 400);
    else logErrorToFile(err, 400);
    res.status(400).json(err);
  }
});

//סעיף 4
// create cards, biz only
//http://localhost:8181/api/cards
router.post(
  "/",
  authmw,
  permissionsMiddleware(true, false, false),
  async (req, res) => {
    try {
      await cardsValidationService.createCardValidation(req.body);
      console.log("tarnegool");
      let normalCard = await normalizeCard(req.body, req.userData._id);
      console.log("kara bekol gadol");
      //console.log(normalCard);
      const dataFromMongoose = await cardsServiceModel.createCard(normalCard);
      console.log("boker tov");
      console.log("dataFromMongoose", dataFromMongoose);
      res.json({ msg: "ok" });
    } catch (err) {
      logErrorToFile(err, 400);
      res.status(400).json(err);
    }
  }
);

//סעיף 5
//edit
// owner
//http://localhost:8181/api/cards/:id
router.put(
  "/:id",
  authmw,
  permissionsMiddleware(false, false, true),
  async (req, res) => {
    try {
      await cardsValidationService.idUserValidation(req.params.id);
      await cardsValidationService.createCardValidation(req.body);
      await normalizeCard(req.body, req.userData._id);
      if (req.body.bizNumber) {
        throw new CustomError("you are not allowed to edit bizNumber");
      }
      if (req.body.password) {
        throw new CustomError("you are not allowed to edit password");
      }
      const cardFromDB = await cardsServiceModel.updateCard(
        req.params.id,
        req.body
      );
      res.json(cardFromDB);
    } catch (err) {
      if (err instanceof CustomError) logErrorToFile(err.msg, 400);
      else logErrorToFile(err, 400);
      res.status(400).json(err);
    }
  }
);

// bonus 1
//edit biz num
// admin
//http://localhost:8181/api/cards/:id
router.put(
  "/biznum/:id",
  authmw,
  permissionsMiddleware(false, true, false),
  async (req, res) => {
    try {
      await cardsValidationService.idUserValidation(req.params.id);
      await cardsValidationService.createCardValidation(req.body);
      let businessNumbers = await cardsServiceModel.findBizNumber(
        req.body.bizNumber
      );
      if (!businessNumbers) {
        const cardFromDB = await cardsServiceModel.updateCard(
          req.params.id,
          req.body
        );
        res.json(cardFromDB);
      } else {
        throw new CustomError("The number is in use");
      }
    } catch (err) {
      if (err instanceof CustomError) logErrorToFile(err.msg, 400);
      else logErrorToFile(err, 400);
      res.status(400).json(err);
    }
  }
);

//סעיף 6

//http://localhost:8181/api/cards/:id
router.patch("/:id", authmw, async (req, res) => {
  try {
    await cardsValidationService.idUserValidation(req.params.id);
    let card = await cardsServiceModel.findOne({ _id: req.params.id });
    const cardLikes = card.likes.find((id) => id === req.userData._id);
    if (!cardLikes) {
      card.likes.push(req.userData._id);
      card = await card.save();
      return res.send(card);
    }
    const cardFiltered = card.likes.filter((id) => id !== req.userData._id);
    card.likes = cardFiltered;
    card = await card.save();
    return res.send(card);
  } catch (error) {
    logErrorToFile(err.msg, 500);
    return res.status(500).send(error);
  }
});

// admin or biz owner
//http://localhost:8181/api/cards/:id
router.delete(
  "/:id",
  authmw,
  permissionsMiddleware(false, true, true),
  async (req, res) => {
    try {
      let num = 400;
      await cardsValidationService.idUserValidation(req.params.id);
      num = 500;
      const cardFromDB = await cardsServiceModel.deleteCard(req.params.id);
      if (cardFromDB) {
        res.json(cardFromDB);
      } else {
        res.json({ msg: "could not find the card" });
      }
    } catch (err) {
      logErrorToFile(err, 500);
      res.status(500).json(err);
    }
  }
);

module.exports = router;
