require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const http = require("http");
const bodyParser = require("body-parser");
const nocache = require("nocache");
const database = require("./src/services/database");

const app = express();
app.use(nocache());
app.use(cors());
app.set("json spaces", 2);
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb" }));
app.use(compression());
// routes
app.use(express.static("public"));
app.use(require("./src/routes/web"));
app.use('/api/v1',require("./src/routes/api"));
// server
const httpServer = http.createServer(app);
httpServer.listen(process.env.HOST_PORT, () => {
  console.log("Server running on port " + process.env.HOST_PORT);
});


