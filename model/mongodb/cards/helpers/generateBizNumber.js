const _ = require("lodash");
const Card = require("../Card");
const { logErrorToFile } = require("../../../../utils/fileLogger");

const generateBizNumber = async () => {
  try {
    for (let i = 1000000; i <= 9999999; i++) {
      const randomNumber = _.random(1000000, 9999999);
      let card = await Card.findOne(
        { bizNumber: randomNumber },
        { bizNumber: 1, _id: 0 }
      );
      if (!card) {
        return randomNumber;
      }
    }
    return null;
  } catch (err) {
    logErrorToFile(err, 500);
    return Promise.reject(err);
  }
};

module.exports = generateBizNumber;
