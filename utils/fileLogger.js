const fs = require("fs");
const CustomError = require("./CustomError");
const path = require("path");

function logErrorToFile(error, statusCode) {
  let errorGood;
  if (error instanceof CustomError) errorGood = error.msg;
  else errorGood = error;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const logFileName = `${year}-${month}-${day}.log`;
  const errorDetails = `Timestamp: ${today.toISOString()}\nStatus Code: ${statusCode}\nError: ${errorGood}\n\n`;
  const logFilePath = path.join(__dirname, "..", "logs", logFileName);
  // Append the error details to the log file
  fs.appendFile(logFilePath, errorDetails, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    } else {
      console.log("Error logged to file:", logFileName);
    }
  });
}

module.exports = { logErrorToFile };
