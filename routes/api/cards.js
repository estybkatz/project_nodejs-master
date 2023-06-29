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

//סעיף 1
// get all cards all
//http://localhost:8181/api/cards
router.get("/", async (req, res) => {
  try {
    const allCards = await cardsServiceModel.getAllCards();
    res.json(allCards);
  } catch (err) {
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

      res.json(myCards);
    } catch (err) {
      console.log("err", err);
      res.status(400).json(err);
    }
  }
);

// get one cards, all
// router.get("/cards/:id", async (req, res) => {
//   try {
//     const card = await cardsServiceModel.getCardById(req.params.id);
//     res.json(card);
//   } catch (err) {
//     res.status(400).json(err);
//   }

//});

//סעיף 3
// all
//http://localhost:8181/api/cards/:id
router.get("/:id", async (req, res) => {
  try {
    await cardsValidationService.idUserValidation(req.params.id);
    const cardFromDB = await cardsServiceModel.getCardById(req.params.id);
    res.json(cardFromDB);
  } catch (err) {
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
      let normalCard = await normalizeCard(req.body, req.userData._id);
      const dataFromMongoose = await cardsServiceModel.createCard(normalCard);
      console.log("dataFromMongoose", dataFromMongoose);
      res.json({ msg: "ok" });
    } catch (err) {
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
      res.status(400).json(err);
    }
  }
);

//סעיף 6
//http://localhost:8181/api/cards/like/:id
// router.patch("/like/:id", authmw, async (req, res) => {
//   try {
//     await cardsValidationService.idUserValidation(req.params.id);
//     const cardId = req.params.id;
//     let cardLike = await cardsServiceModel.getCardById(cardId);
//     if (cardLike.likes.find((userId) => userId == req.userData._id)) {
//       const cardFiltered = cardLike.likes.filter(
//         (userId) => userId != req.userData._id
//       );
//       cardLike.likes = cardFiltered;
//       cardLike = await cardLike.save();
//       // return res.send(card);
//     } else {
//       cardLike.likes = [...cardLike.likes, req.userData._id];
//       cardLike = await cardLike.save();
//       // return res.send(card);
//     }
//     res.json(cardLike);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

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
    return res.status(500).send(error.message);
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
      await idUserValidation(req.params.id);

      const cardFromDB = await cardsServiceModel.deleteCard(req.params.id);
      if (cardFromDB) {
        res.json({ msg: "card deleted" });
      } else {
        res.json({ msg: "could not find the card" });
      }
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

module.exports = router;
