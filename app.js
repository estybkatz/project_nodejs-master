const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const apiRouter = require("./routes/api");
const config = require("config");
const initialData = require("./initialData/initialData");
const chalk = require("chalk");
const morgan = require("morgan");
const fs = require("fs");
const { logErrorToFile } = require("./utils/fileLogger");

const app = express();

//console.log("file", config.get("file"));
// console.log("anotherKey", config.get("anotherKey"));

//app.use(cors());
app.use(
  cors({
    origin: ["http://authorizedaddress", "http://localhost:8181/api"],

    optionsSuccessStatus: 200,
  })
);
// app.use(
//   logger(
//     ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
//   )
// );

//app.use(logger(":date[iso] :method :url :status :response-time ms"));
app.use(
  morgan((tokens, req, res) => {
    const status = res.statusCode;
    const color = status < 400 ? chalk.green : chalk.red;
    const statusText = color(status);
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const responseTime = tokens["response-time"](req, res);
    //console.log(res);
    return `${chalk.gray(
      tokens.date(req, res, "iso")
    )} ${method} ${url} ${statusText} ${color(`${responseTime}ms`)}`;
  })
);
// app.use((req, res, next) => {
//   try {
//     if (res.status < 399) {
//       return;
//     } else {
//       logErrorToFile(res.message, res.status);
//     }
//   } catch (err) {
//     console.log("inside the catch");
//     logErrorToFile(err.message, err.statusCode);
//   }
// });
// function logErrorToFile(error, statusCode) {
//         const today = new Date();
//         const year = today.getFullYear();
//         const month = String(today.getMonth() + 1).padStart(2, "0");
//         const day = String(today.getDate()).padStart(2, "0");
//         const logFileName = `${year}-${month}-${day}.log`;

//         // Format the error details
//         const errorDetails = `Timestamp: ${today.toISOString()}\nStatus Code: ${statusCode}\nError: ${error}\n\n`;

//         // Append the error details to the log file
//         fs.appendFile(logFileName, errorDetails, (err) => {
//           if (err) {
//             res.status(500).json("err");
//             console.error("Error writing to log file:", err);
//           } else {
//             res.status(500).json("err");
//             console.log("Error logged to file:", logFileName);
//           }
//         });
//       }
//       logErrorToFile(err, res.statusCode);
//       //   const date = Date.now() + ".txt";
//       //   console.log(date);
//       //   fs.writeFile(date, { morgan }, (err) => {
//       //     if (err) {
//       //       console.error("Error creating file:", err);
//       //     } else {
//       //       console.log("File created successfully.");
//       //     }
//       //   });
//     }
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });
// app.use(
//   logger((tokens, req, res) => {
//     return [
//       new Date().toISOString().replace("T", " "),
//       tokens.method(req, res),
//       tokens.url(req, res),
//       tokens.status(req, res),
//       tokens.res(req, res, "content-length"),
//       "-",
//       tokens["response-time"](req, res),
//       "ms",
//     ].join(" ");
//   })
// );
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//app.use("/admin", express.static(path.join(__dirname, "admin")));
// app.use("/biz", express.static(path.join(__dirname, "biz")));
// app.use("/regular", express.static(path.join(__dirname, "regular")));
initialData();
app.use("/api", apiRouter);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public", "images")));
app.use((req, res, next) => {
  res.status(404).json({ err: "page not found" });
});

module.exports = app;
