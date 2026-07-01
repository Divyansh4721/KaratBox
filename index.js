const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const passport = require("passport");
const path = require("path");
const cookieParser = require("cookie-parser");
const env = require("./config/environment");
const app = express();
const PORT = 8002;
const DATABASE_URL = `mongodb://localhost/${env.db}`;
require("./config/passport_google_oauth2_strategy");
const connectDB = async () => {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};
connectDB();
app.use(
  session({
    name: env.session_app_name,
    secret: env.session_cookie_key,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: DATABASE_URL }),
    cookie: {
      maxAge: Number(env.cookieTime)
    }
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://dimoss.in");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
const bodyParser = require("body-parser");
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);
app.use(express.json());
app.use(
  express.json({
    type: (req) =>
      req.headers["content-type"] &&
      req.headers["content-type"].includes("json")
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/assets", express.static(__dirname + "/assets"));
app.use("/uploads", express.static(__dirname + "/uploads"));
const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);
const flash = require("connect-flash");
const customMware = require("./config/middleware");
app.use(flash());
app.use(customMware.setFlash);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/", require("./routes/index"));
app.listen(PORT, (err) => {
  if (err) {
    console.error(`❌ Error starting server: ${err}`);
  } else {
    console.log(`🚀 Server running on port ${PORT}`);
  }
});
