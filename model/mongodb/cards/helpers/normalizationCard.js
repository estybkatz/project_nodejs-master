const generateBizNumber = require("./generateBizNumber");

const normalizeCard = async (card, userId) => {
  if (!card.image) {
    card.image = {};
  }
  card.image = {
    url:
      card.image.url ||
      "https://cdn.pixabay.com/photo/2020/04/07/17/01/chicks-5014152_960_720.jpg",
    alt: card.image.alt || "yellow fluffy chickens",
  };
  return {
    ...card,
    address: {
      ...card.address,
      state: card.address.state || "",
    },
    bizNumber: card.bizNumber || (await generateBizNumber()),
    user_id: card.user_id || userId,
    web:
      card.web ||
      "https://images.pexels.com/photos/17145787/pexels-photo-17145787/free-photo-of-beach-sand-water-ocean.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
  };
};

module.exports = normalizeCard;
