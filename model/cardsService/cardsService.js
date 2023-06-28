const config = require("config");
const cardsServiceMongo = require("../mongodb/cards/cardsService");
const dbOption = config.get("dbOption");
const createCard = (cardToSave) => {
  if (dbOption === "mongo") {
    return cardsServiceMongo.createCard(cardToSave);
  }
};

const getAllCards = () => {
  if (dbOption === "mongo") {
    return cardsServiceMongo.getAllCards();
  }
};

const getCardById = (id) => {
  if (dbOption === "mongo") {
    return cardsServiceMongo.getCardById(id);
  }
};

const getCardByBizNumber = (bizNumber) => {
  if (dbOption === "mongo") {
    return cardsServiceMongo.getCardByBizNumber(bizNumber);
  }
};

const updateCard = (id, cardToUpdate) => {
  if (dbOption === "mongo") {
    return cardsServiceMongo.updateCard(id, cardToUpdate);
  }
};

const deleteCard = (id) => {
  if (dbOption === "mongo") {
    return cardsServiceMongo.deleteCard(id);
  }
};
const findOne = (id) => {
  if (dbOption === "mongo") {
    return cardsServiceMongo.findOne(id);
  }
};

module.exports = {
  createCard,
  getAllCards,
  getCardById,
  getCardByBizNumber,
  updateCard,
  deleteCard,
  findOne,
};
