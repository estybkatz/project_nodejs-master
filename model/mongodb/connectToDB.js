const config = require("config");
const mongoose = require("mongoose");
const chalk = require("chalk");
console.log(chalk.whiteBright.bold("con str", config.get("dbConfig.url")));

const connectToDB = () => {
  return mongoose.connect(config.get("dbConfig.url"));
};

module.exports = connectToDB;
