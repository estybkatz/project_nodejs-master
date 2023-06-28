const mongoose = require("mongoose");
const {
  URL,
  DEFAULT_STRING_SCHEMA_REQUIRED,
  DEFAULT_STRING_SCHEMA,
} = require("./helpers/mongooseValidation");

const Image = new mongoose.Schema({
  url: URL,
  alt: DEFAULT_STRING_SCHEMA,
});

module.exports = Image;
