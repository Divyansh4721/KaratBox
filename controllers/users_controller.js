const fs = require("fs");
const path = require("path");
const breadcrumb = require("../config/breadcrumbs");
const passportController = require("../config/passport_google_oauth2_strategy");
const env = require("../config/environment");
const User = require("../models/user");

module.exports.signin = async function (req, res) {
  if (req.isAuthenticated()) {
    req.flash("success", "Already Signed In!");
    return res.redirect("/");
  }
  passportController.UpdateStrategy();
  return res.render("users/user_signin", {
    title: "Sign In",
    layout: false
  });
};
module.exports.checkuser = function (req, res) {
  req.flash("success", "Logged In Successfully");
  return res.redirect("/");
};
module.exports.destroysession = function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have been Logged Out");
    return res.redirect("/users/signin");
  });
};
module.exports.profilePage = async function (req, res) {
  try {
    let userlist = await User.findById(req.user.id);
    return res.render("users/user_profile", {
      title: "My Profile",
      activeNav: "",
      userlist,
      ...breadcrumb.label("My Profile")
    });
  } catch (err) {
    console.log("Error in User Profile Page!", err);
    req.flash("error", "Error in User Profile Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.profileForm = async function (req, res) {
  User.uploadImage(req, res, async function (err) {
    if (err) {
      console.log("Image upload error", err);
      req.flash(
        "error",
        "Invalid image file. Use PNG, JPG, or WEBP under 2MB."
      );
      return res.redirect("/user_profile");
    }
    try {
      const user = await User.findById(req.user.id);
      user.name = req.body.name.replace(/[^a-zA-Z0-9 ]/g, " ");
      const avatarAction = req.body.avatarAction || "";
      if (avatarAction === "google" && user.googleAvatar) {
        user.useGoogleAvatar = true;
        user.avatar = user.googleAvatar;
      } else if (avatarAction === "remove") {
        user.useGoogleAvatar = false;
        user.avatar = "";
      } else if (req.file) {
        const fileName = "profile-" + user.id + ".png";
        await fs.promises.writeFile(
          User.imageFullPath + "/" + fileName,
          req.file.buffer
        );
        user.useGoogleAvatar = false;
        user.avatar = User.imagePath + "/" + fileName;
      }
      await user.save();
      req.flash("success", "Profile Updated Successfully!");
      return res.redirect("/user_profile");
    } catch (saveErr) {
      console.log("Error in Updating User Profile!", saveErr);
      req.flash("error", "Error in Updating User Profile!");
      return res.redirect("/user_profile");
    }
  });
};
