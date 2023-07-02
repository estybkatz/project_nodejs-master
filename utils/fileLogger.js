const fs = require("fs");

function logErrorToFile(error, statusCode) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const logFileName = `${year}-${month}-${day}.log`;
  //console.log(error);
  // Format the error details
  const errorDetails = `Timestamp: ${today.toISOString()}\nStatus Code: ${statusCode}\nError: ${error}\n\n`;

  // Append the error details to the log file
  fs.appendFile(logFileName, errorDetails, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    } else {
      console.log("Error logged to file:", logFileName);
    }
  });
}

module.exports = { logErrorToFile };
