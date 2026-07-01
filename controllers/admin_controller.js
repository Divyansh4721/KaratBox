const env = require("../config/environment");
const User = require("../models/user");
const Permission = require("../models/permission");
const Env_Variable = require("../models/env_variable");
const mongoose = require("mongoose");
const common_function = require("../controllers/common_function");
const breadcrumb = require("../config/breadcrumbs");
const db = mongoose.connection;
module.exports.DeveloperConsolePage = async function (req, res) {
  try {
    return res.render("admin_developerConsole", {
      title: "Developer Console"
    });
  } catch (err) {
    console.log("Error in Developer Console Page!", err);
    req.flash("error", "Error in Developer Console Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.settingsPage = async function (req, res) {
  try {
    let envVariables = `[
            { "nickname": "App Name", "name": "AppName", "defaultValue": "Jewellery", "disabled":false },
            { "nickname": "Tag Name", "name": "TagName", "defaultValue": "Jeweller", "disabled":false },
            { "nickname": "Gold Price", "name": "goldPrice", "defaultValue": "0", "disabled":false },
            { "nickname": "Days Before Delete", "name": "XDaysToDelete", "defaultValue": "365", "disabled":false },
            { "nickname": "Start Hour", "name": "startHour", "defaultValue": "10", "disabled":false },
            { "nickname": "End Hour", "name": "endHour", "defaultValue": "20", "disabled":false },
            { "nickname": "Days Allowed", "name": "daysAllowed", "defaultValue": "false true true true true true true", "disabled":false },
            { "nickname": "Mail ID (Without @)", "name": "mailUser", "defaultValue": "Jeweller", "disabled":false },
            { "nickname": "Mail Password", "name": "mailPassword", "defaultValue": "XXXXXXXXX", "disabled":false },
            { "nickname": "Mail From (With @)", "name": "mailFrom", "defaultValue": "jeweller@gmail.com", "disabled":false },
            { "nickname": "Mail To (With @)", "name": "backUpMail", "defaultValue": "jeweller@gmail.com", "disabled":false },
            { "nickname": "Google ClientID", "name": "google_clientID", "defaultValue": "1040813539779-e2bm980dlnbra89pmsiscont0q4om6rp.apps.googleusercontent.com", "disabled":true },
            { "nickname": "Google ClientSecret", "name": "google_clientSecret", "defaultValue": "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", "disabled":true },
            { "nickname": "Google CallbackURL", "name": "google_callbackURL", "defaultValue": "http://stock.divyanshbansal.com/users/auth/google/callback", "disabled":true }
        ]`;
    envVariables = JSON.parse(envVariables);
    let variables = await Promise.all(
      envVariables.map(async (tempEnv) => {
        let variable = await Env_Variable.findOne({ name: tempEnv.name });
        if (!variable) {
          variable = await Env_Variable.create({
            name: tempEnv.name,
            nickname: tempEnv.nickname,
            value: tempEnv.defaultValue,
            disabled: tempEnv.disabled
          });
        }
        return variable;
      })
    );
    let daysAllowedVar = variables.find((v) => v.name === "daysAllowed");
    let daysAllowed = daysAllowedVar.value.split(" ").map((i) => i === "true");
    variables.splice(variables.findIndex((v) => v.name === "daysAllowed"), 1);
    return res.render("admin/admin_environment", {
      title: "Settings",
      variables,
      daysAllowed
    });
  } catch (err) {
    console.log("Error in Settings Page!", err);
    req.flash("error", "Error in Settings Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.sessionPage = async function (req, res) {
  try {
    let session = await db.collection("sessions").find({}).toArray();
    let newSession = [];
    for (let i = 0; i < session.length; i++) {
      let s = session[i];
      let newObj = {};
      if (JSON.parse(s.session).passport === undefined) {
        continue;
      }
      let temp = await User.findById(JSON.parse(s.session).passport.user);
      newObj["email"] = temp.email;
      newObj["name"] = temp.name;
      newObj["id"] = s._id;
      newObj["expires"] = new Date(new Date(s.expires) - env.cookieTime);
      newSession.push(newObj);
    }
    newSession.sort((a, b) => b.expires - a.expires);
    for (let i = 0; i < newSession.length; i++) {
      newSession[i].expires = common_function.convertTime(newSession[i].expires);
    }
    return res.render("admin/admin_session", {
      title: "Session Page",
      sessionlist: newSession,
      breadcrumbs: breadcrumb.trail([
        { label: "Staff Management", href: "/permission" },
        { label: "Session Page" }
      ])
    });
  } catch (err) {
    await db.collection("sessions").deleteMany({});
    console.log("Error in Session Page!", err);
    req.flash("error", "Error in Session Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.updateSettingsApi = async function (req, res) {
  try {
    let envVariables = [
      "AppName", "TagName", "goldPrice", "XDaysToDelete", "startHour", "endHour",
      "daysAllowed", "mailUser", "mailPassword", "mailFrom", "backUpMail",
      "google_clientID", "google_clientSecret", "google_callbackURL"
    ];
    await Promise.all(
      envVariables.map(async (name) => {
        let variable = await Env_Variable.findOne({ name });
        if (name === "daysAllowed") {
          variable.value = req.body[name].map((value) => value === "on").join(" ");
        } else {
          variable.value = req.body[name];
        }
        await variable.save();
      })
    );
    return res.status(200).json({ success: true, message: "Settings updated successfully!" });
  } catch (err) {
    console.log("Error in Update Settings API!", err);
    return res.status(500).json({ success: false, message: "Internal Server Error while updating settings." });
  }
};
module.exports.deleteSessionApi = async function (req, res) {
  try {
    if (req.body.id === "all") {
      await db.collection("sessions").deleteMany({});
    } else {
      await db.collection("sessions").findOneAndDelete({ _id: req.body.id });
    }
    return res.status(200).json({ success: true, message: "Session(s) deleted successfully!" });
  } catch (err) {
    console.log("Error in Deleting Session API!", err);
    return res.status(500).json({ success: false, message: "Error in deleting session metadata." });
  }
};
module.exports.createUserApi = async function (req, res) {
  try {
    let temp = await User.find({ email: req.body.email });
    if (temp.length != 0) {
      return res.status(409).json({ success: false, message: "User identity already exists!" });
    }
    let newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      adminPermissionTemp: false,
      adminPermissionPerm: false,
      cart: []
    });
    return res.status(201).json({ success: true, message: "User created successfully!", data: newUser });
  } catch (err) {
    console.log("Error in Creating User API!", err);
    return res.status(500).json({ success: false, message: "Internal server error during user creation." });
  }
};
module.exports.updateUserApi = async function (req, res) {
  try {
    let user = await User.findById(req.body.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Target user not found." });
    }
    if (user.email !== req.body.email) {
      let temp = await User.find({ email: req.body.email });
      if (temp.length != 0) {
        return res.status(409).json({ success: false, message: "Username/Email already explicitly in use!" });
      }
    }
    user.name = req.body.name;
    user.email = req.body.email;
    await user.save();
    return res.status(200).json({ success: true, message: "User details altered successfully!", data: user });
  } catch (err) {
    console.log("Error in updating core user values!", err);
    return res.status(500).json({ success: false, message: "Failure updating core user profile data." });
  }
};
module.exports.deleteUserApi = async function (req, res) {
  try {
    let user = await User.findById(req.body.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Target user entity not found." });
    }
    await User.findByIdAndDelete(req.body.id);
    return res.status(200).json({ success: true, message: "User removed successfully!" });
  } catch (err) {
    console.log("Error inside delete user route!", err);
    return res.status(500).json({ success: false, message: "Internal failure dropping user item." });
  }
};
module.exports.getUserPermissionsApi = async function (req, res) {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }
    let permission = await Permission.find({});
    permission = permission.filter((obj) => obj.listname !== "admin");
    for (let i = 0; i < permission.length; i++) {
      permission[i].available = permission[i].users.includes(req.params.id);
    }
    permission.sort(common_function.sortByProperty("nickname", 1));
    return res.status(200).json({
      success: true,
      data: { user, permission }
    });
  } catch (err) {
    console.log("Error retrieving user permission manifest mapping!", err);
    return res.status(500).json({ success: false, message: "Error processing contextual mapping rules safely." });
  }
};
module.exports.updateUserPermissionsApi = async function (req, res) {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User identity block not resolved." });
    }
    let permission = await Permission.find({});
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.adminPermissionTemp = req.body.adminPermissionTemp ? true : false;
    user.adminPermissionPerm = req.body.adminPermissionPerm ? true : false;
    await user.save();
    const chosenPermissions = req.body.permission === undefined ? [] : [].concat(req.body.permission);
    for (let p of permission) {
      if (chosenPermissions.includes(p.id)) {
        if (!p.users.includes(user.id)) p.users.push(user.id);
      } else {
        p.users.pull(user.id);
      }
      await p.save();
    }
    return res.status(200).json({ success: true, message: "User context and rules modified perfectly!" });
  } catch (err) {
    console.log("Error processing batch permission payload sync loops!", err);
    return res.status(500).json({ success: false, message: "Error mapping updated access structures cleanly." });
  }
};
module.exports.toggleUserPermissionApi = async function (req, res) {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User entity context not resolved." });
    }
    user.adminPermissionTemp = !user.adminPermissionTemp;
    await user.save();
    return res.status(200).json({
      success: true,
      message: `Temporary Admin permission changed to: ${user.adminPermissionTemp}`,
      adminPermissionTemp: user.adminPermissionTemp
    });
  } catch (err) {
    console.log("Error structural toggling permission variable flags!", err);
    return res.status(500).json({ success: false, message: "Internal database switch flag assignment errors." });
  }
};