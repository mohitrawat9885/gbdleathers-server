const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const https = require("https");
const fs = require("fs");

process.on("uncaughtException", (err) => {
  // console.log("UNCAUGHT EXCEPTION ☠️☠️☠️ Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({
  path: "./config.env",
});

const app = require("./app");
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
const DB_L = process.env.DATABASE_LOCAL;
mongoose.connect(DB).then(() => {
  console.log("Database Connected Successfully!");
});

const PORT = process.env.PORT;
let server;
// if (process.env.NODE_ENV === "production") {
//   const privateKey = fs.readFileSync(
//     "/etc/letsencrypt/live/gbdleathers.com/privkey.pem",
//     "utf8"
//   );
//   const certificate = fs.readFileSync(
//     "/etc/letsencrypt/live/gbdleathers.com/cert.pem",
//     "utf8"
//   );
//   const ca = fs.readFileSync(
//     "/etc/letsencrypt/live/gbdleathers.com/fullchain.pem",
//     "utf8"
//   );
//   const credentials = {
//     key: privateKey,
//     cert: certificate,
//     ca: ca,
//   };

//   server = https.createServer(credentials, app).listen(443, () => {
//     console.log("HTTPS Server running on port 443");
//   });
//   server = http
//     .createServer(function (req, res) {
//       res.writeHead(301, {
//         Location: "https://" + req.headers["host"] + req.url,
//       });
//       res.end();
//     })
//     .listen(40);
// } else
  if (process.env.NODE_ENV !== "development") {
  server = app.listen(PORT, () => console.log(`Listening at Port ${PORT}`));
} else {
  server = app.listen(PORT, () => console.log(`Listening at Port ${PORT}`));
}

// const server = app.listen(PORT, () => {
//   console.log(`Server started at Port: ${PORT}`);
// });

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION ☠️☠️☠️ Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
