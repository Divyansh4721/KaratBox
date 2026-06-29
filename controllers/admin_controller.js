const env = require("../config/environment");
const User = require("../models/user");
const Permission = require("../models/permission");
const Env_Variable = require("../models/env_variable");
const mongoose = require("mongoose");
const common_function = require("../controllers/common_function");
const breadcrumb = require("../config/breadcrumbs");
const { use } = require("passport");
const db = mongoose.connection;
module.exports.DeveloperConsole = async function (req, res) {
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
module.exports.environment = async function (req, res) {
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
        let variable = await Env_Variable.findOne({
          name: tempEnv.name
        });
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
    variables.splice(
      variables.findIndex((v) => v.name === "daysAllowed"),
      1
    );
    return res.render("admin/admin_environment", {
      title: "Settings",
      variables,
      daysAllowed
    });
  } catch (err) {
    console.log("Error in Environment Page!", err);
    req.flash("error", "Error in Environment Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.environmentForm = async function (req, res) {
  try {
    let envVariables = [
      "AppName",
      "TagName",
      "goldPrice",
      "XDaysToDelete",
      "startHour",
      "endHour",
      "daysAllowed",
      "mailUser",
      "mailPassword",
      "mailFrom",
      "backUpMail",
      "google_clientID",
      "google_clientSecret",
      "google_callbackURL"
    ];
    await Promise.all(
      envVariables.map(async (name) => {
        let variable = await Env_Variable.findOne({
          name
        });
        if (name === "daysAllowed") {
          variable.value = req.body[name]
            .map((value) => value === "on")
            .join(" ");
        } else {
          variable.value = req.body[name];
        }
        await variable.save();
      })
    );
    req.flash("success", "Updated Environment Form Successfully!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Environment Form!", err);
    req.flash("error", "Error in Environment Form!");
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
      newSession[i].expires = common_function.convertTime(
        newSession[i].expires
      );
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
module.exports.sessionDelete = async function (req, res) {
  try {
    if (req.params.id === "all") {
      await db.collection("sessions").deleteMany({});
    } else {
      await db.collection("sessions").findOneAndDelete({
        _id: req.params.id
      });
    }
    req.flash("success", "Session Deleted Successfully!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Deleting Session!", err);
    req.flash("error", "Error in Deleting Session!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.permissionPage = async function (req, res) {
  try {
    let user = await User.find({});
    user.sort(common_function.sortByProperty("name", 1));
    return res.render("admin/admin_permission", {
      title: "Staff Management",
      breadcrumbLabel: "Staff Management",
      userlist: user
    });
  } catch (err) {
    console.log("Error in Permission Page!", err);
    req.flash("error", "Error in Permission Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.permissionPage_UserButton = async function (req, res) {
  try {
    let user = await User.findById(req.params.id);
    let permission = await Permission.find({});
    permission = permission.filter((obj) => obj.listname !== "admin");
    for (let i = 0; i < permission.length; i++) {
      permission[i].available = permission[i].users.includes(req.params.id);
    }
    permission.sort(common_function.sortByProperty("nickname", 1));
    return res.render("admin/admin_permission_user", {
      title: "User Permission",
      userlist: user,
      breadcrumbs: breadcrumb.trail([
        { label: "Staff Management", href: "/permission" },
        { label: user.name }
      ])
    });
  } catch (err) {
    console.log("Error in User Permission Page!", err);
    req.flash("error", "Error in User Permission Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.permissionPage_TempPermission = async function (req, res) {
  try {
    let user = await User.findById(req.params.id);
    user.adminPermissionTemp = !user.adminPermissionTemp;
    await user.save();
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Giving User Temporary Permission!", err);
    req.flash("error", "Error in Giving User Temporary Permission!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.permissionPage_UserCreatePage = async function (req, res) {
  try {
    return res.render("admin_new_user", {
      title: "Create User"
    });
  } catch (err) {
    console.log("Error in User Create Page!", err);
    req.flash("error", "Error in User Create Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.permissionPage_UserCreateForm = async function (req, res) {
  try {
    let temp = await User.find({
      email: req.body.email
    });
    if (temp.length != 0) {
      req.flash("error", "User Already Exists!");
      return res.redirect(req.get("Referrer") || "/");
    }
    await User.create({
      name: req.body.name,
      email: req.body.email,
      adminPermissionTemp: false,
      adminPermissionPerm: false,
      cart: []
    });
    req.flash("success", "User Created Successfully!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Creating User!", err);
    req.flash("error", "Error in Creating User!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.permissionPage_UserForm = async function (req, res) {
  try {
    let user = await User.findById(req.params.id);
    let permission = await Permission.find({});
    if (user.email === req.body.email) {
    } else {
      let temp = await User.find({
        email: req.body.email
      });
      if (temp.length != 0) {
        req.flash("error", "Username Already Exists!");
        return res.redirect(req.get("Referrer") || "/");
      }
    }
    user.name = req.body.name;
    user.email = req.body.email;
    user.adminPermissionTemp = req.body.adminPermissionTemp ? true : false;
    user.adminPermissionPerm = req.body.adminPermissionPerm ? true : false;
    await user.save();
    permission.forEach(async (p) => {
      if (req.body.permission === undefined) p.users.pull(user.id);
      else if (req.body.permission === p.id && !p.users.includes(user.id))
        p.users.push(user.id);
      else if (req.body.permission.includes(p.id) && !p.users.includes(user.id))
        p.users.push(user.id);
      else if (
        req.body.permission === p.id ||
        req.body.permission.includes(p.id)
      ) {
      } else p.users.pull(user.id);
      await p.save();
    });
    req.flash("success", "User permissions updated successfully!");
    return res.redirect("/permission_user/" + user.id);
  } catch (err) {
    console.log("Error in Updating User Permission!", err);
    req.flash("error", "Error in Updating User Permission!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
