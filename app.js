const express = require("express");
const path = require("path");
const app = express();

//const cors = require("cors");

const AdminRoutes = require("./Routes/AdminRoutes");
const CustomerRoutes = require("./Routes/CustomerRoutes");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50MB" }));

app.use(express.static(path.join(__dirname, "client")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
  res.end();
});

app.use("/admin", AdminRoutes);
app.use("/customer", CustomerRoutes);

module.exports = app;
