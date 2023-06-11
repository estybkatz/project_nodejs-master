const Joi = require("joi");
const idSchema = Joi.string().length(24).hex().required();

const validateIdSchema = (userInput) => idSchema.validateAsync(userInput);

module.exports = {
  validateIdSchema,
};
