const mongoose = require("mongoose");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");
const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    //useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then((con) => {
    console.log("😎😎Database Connected");
  })
  .catch((err) => {
    console.log("🙄🙄Error Connecting Database");
    console.log(err);
  });

const PORT = process.env.PORT || 8000;

if (process.env.NODE_ENV === "production") {
  const privateKey = fs.readFileSync(
    "/etc/letsencrypt/live/gbdhandwork.com/privkey.pem",
    "utf8"
  );
  const certificate = fs.readFileSync(
    "/etc/letsencrypt/live/gbdhandwork.com/cert.pem",
    "utf8"
  );
  const ca = fs.readFileSync(
    "/etc/letsencrypt/live/gbdhandwork.com/chain.pem",
    "utf8"
  );
  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca,
  };
  https.createServer(credentials, app).listen(443, () => {
    console.log("HTTPS Server running on port 443");
  });
  http
    .createServer(function (req, res) {
      res.writeHead(301, {
        Location: "https://" + req.headers["host"] + req.url,
      });
      res.end();
    })
    .listen(80);
} else if (process.env.NODE_ENV === "development") {
  app.listen(PORT, () => console.log(`Listening at Port ${PORT}`));
} else {
  app.listen(PORT, () => console.log(`Listening at Port ${PORT}`));
}
