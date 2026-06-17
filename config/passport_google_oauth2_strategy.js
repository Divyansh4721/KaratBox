const passport = require("passport");
const googleStrategy = require("passport-google-oauth").OAuth2Strategy;
const User = require("../models/user");
const Permission = require("../models/permission");
const Env_Variable = require("../models/env_variable");
const mongoose = require("mongoose");
const db = mongoose.connection;
// tell passport to use a new strategy for google
passport.UpdateStrategy = async function () {
  // let google_clientID = await Env_Variable.findOne({
  //     name: "google_clientID"
  // });
  // let google_clientSecret = await Env_Variable.findOne({
  //     name: "google_clientSecret"
  // });
  // let google_callbackURL = await Env_Variable.findOne({
  //     name: "google_callbackURL"
  // });
  let google_clientID =
    "1091177947332-s8ua81ckqlamuuuphd4v3opg76pnqtp8.apps.googleusercontent.com";
  let google_clientSecret = "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";
  let google_callbackURL =
    "https://karatbox2.autogenai.in/users/auth/google/callback";
  passport.use(
    new googleStrategy(
      {
        clientID: google_clientID,
        clientSecret: google_clientSecret,
        callbackURL: google_callbackURL
      },
      async function (accessToken, refreshToken, profile, done) {
        try {
          let user = await User.findOne({
            email: profile.emails[0].value
          });
          if (user) {
            // checking if user already signed in somewhere else
            let sessions = await db.collection("sessions").find({}).toArray();
            for (let item of sessions)
              if (
                !JSON.parse(item.session).passport ||
                user.id == JSON.parse(item.session).passport.user
              )
                await db.collection("sessions").findOneAndDelete(item);
            return done(null, user);
          }
          return done(null, false);
        } catch (err) {
          console.log("Error in Google Authentication!", err);
          return done(null, false);
        }
      }
    )
  );
};
// seriallizing the user which things to be kept in the cookie
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
// deserializing the user from the key in the cookies
passport.deserializeUser(async function (id, done) {
  try {
    let user = await User.findById(id);
    return done(null, user);
  } catch (error) {
    console.log("Error in finding user local strategy", error);
    return done(error);
  }
});
// check if user is authenticated
passport.checkAuthentication = async function (req, res, next) {
  // if user is signed in ,then pass on the request to the next function controller action
  try {
    // If Developer has given permission for software license
    let devPermission = true;
    // Checking if there is a user in req
    if (req.user) {
      // checking if user is an admin
      let user = await User.findById(req.user.id);
      let permission = await Permission.findOne({
        listname: "admin"
      });
      if (devPermission) {
        if (req.isAuthenticated()) {
          // If Admin Sign in directly
          if (permission.users.includes(user.id)) {
            return next();
          } else {
            // If normal user
            let startHour = await Env_Variable.findOne({
              name: "startHour"
            });
            startHour = startHour.value;
            let endHour = await Env_Variable.findOne({
              name: "endHour"
            });
            endHour = endHour.value;
            let daysBool = await Env_Variable.findOne({
              name: "daysAllowed"
            });
            // let days = "Sun Mon Tue Wed Thr Fri Sat";
            daysBool = daysBool.value;
            daysBool = daysBool.split(" ").map((i) => i === "true");
            let currentHour = new Date().getHours();
            let currentDay = new Date().getDay();
            if (
              daysBool[currentDay] &&
              currentHour >= startHour &&
              currentHour < endHour
            ) {
              // If admin has given permission
              if (user.adminPermissionTemp || user.adminPermissionPerm) {
                return next();
              }
            }
          }
        }
      }
    }
    // if user not authorized
    req.logout(function (err) {});
    return res.redirect("/users/signin");
  } catch (err) {
    console.log("Error in Checking Authentication!", err);
    req.logout(function (err) {});
    return res.redirect("/users/signin");
  }
};
passport.setAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    // req.user contains current user from current cookie and we are sending it to locals for the view
    res.locals.user = req.user;
  }
  next();
};
module.exports = passport;
