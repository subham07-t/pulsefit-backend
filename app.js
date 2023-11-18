const inDevMode = true;

const bodyParser = require("body-parser");
const express = require("express");
const dotenv = require("dotenv");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const stripe = require("stripe")(
  inDevMode ? process.env.STRIPE_SK_TEST : STRIPE_SK_LIVE
);
const jwt = require("jsonwebtoken");
const cors = require("cors");
const Sentry = require("@sentry/node");
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
});

!inDevMode
  ? Sentry.init({
      dsn: process.env.SENTRY_DSN_KEY,

      // We recommend adjusting this value in production, or using tracesSampler
      // for finer control
      tracesSampleRate: 1.0,
    })
  : null;
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "API documentation",
      version: "1.0.0",
    },
  },
  apis: ["./services/apiDocumentation.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
dotenv.config();

const PORT = process.env.PORT || 8081;
const app = express();

const server = require("http").createServer(app);
const { db } = require("./models/database");

const socketIo = require("socket.io");
const { firebaseConfig } = require("./models/firebaseConfig");

const io = socketIo(server);
require("./controllers/payments")(app, db, inDevMode, stripe, io);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.APP_BASE_URL);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

let whitelist;
if (inDevMode) {
  whitelist = ["http://localhost:8000"];
} else {
  whitelist = [
    "http://localhost:8001", //adding localhost for testing
  ];
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.engine("html", require("ejs").renderFile);
app.use(express.static("static"));

app.all("*", (req, res, next) => {
  var origin = req.headers.origin;
  if (whitelist.indexOf(origin) != -1) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Headers", [
    "Content-Type",
    "X-Requested-With",
    "X-HTTP-Method-Override",
    "Accept",
  ]);
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,POST");
  res.header("Cache-Control", "no-store,no-cache,must-revalidate");
  res.header("Vary", "Origin");
  if (req.method === "OPTIONS") {
    res.status(200).send("");
    return;
  }
  next();
});

require("./controllers/general")(app, swaggerUI, swaggerDocs, inDevMode, db);
require("./controllers/account")(app, db, inDevMode, jwt, stripe);
require("./controllers/challenges")(app, db, inDevMode);
require("./controllers/workouts")(app, db, inDevMode);
require("./controllers/workoutcontent")(app, db, inDevMode);
require("./controllers/programs")(app, db, inDevMode);
require("./controllers/testPlans")(app, db, inDevMode);
require("./controllers/mySQLActions")(app, db, inDevMode);
require("./controllers/trainer")(app, db, inDevMode);
require("./controllers/notifications")(app, db, inDevMode, admin);
require("./controllers/sockets")(app, inDevMode, io, db);
require("./controllers/dataDump")(app, db, inDevMode);

//New CF Backend routes
app.use("/api/CF", require("./routes/api/CoachWeb/CFCoachWebRoutes"));

inDevMode
  ? app.listen(8080, function () {
      // server.close(function () {
      console.log("Server on IP!");
      // server.listen(3000, "192.168.1.12");
      // });
    })
  : server.listen(PORT, () => {
      console.log("server started", PORT);
    });
