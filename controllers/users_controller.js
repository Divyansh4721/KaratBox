const fs = require("fs");
const path = require("path");
const breadcrumb = require("../config/breadcrumbs");
const passportController = require("../config/passport_google_oauth2_strategy");
const env = require("../config/environment");
const User = require("../models/user");

function avatarSrc(user) {
  if (!user || !user.avatar) return "";
  if (user.avatar.startsWith("http") || user.avatar.startsWith("/")) {
    return user.avatar;
  }
  return "/uploads/" + user.avatar;
}

module.exports.signin = async function (req, res) {
  if (req.isAuthenticated()) {
    req.flash("success", "Already Signed In!");
    return res.redirect("/");
  }
  passportController.UpdateStrategy();
  return res.render("auth/_user_signin", {
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
    return res.render("user_profile", {
      title: "My Profile",
      activeNav: "",
      userlist,
      avatarSrc: avatarSrc(userlist),
      ...breadcrumb.label("My Profile")
    });
  } catch (err) {
    console.log("Error in User Profile Page!", err);
    req.flash("error", "Error in User Profile Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.profileForm = async function (req, res) {
  if (String(req.user.id) !== String(req.body.id)) {
    req.flash("error", "Invalid request!");
    return res.redirect("/user_profile");
  }
  User.uploadImage(req, res, async function (err) {
    if (err) {
      console.log("Image upload error", err);
      req.flash("error", "Invalid image file. Use PNG, JPG, or WEBP under 2MB.");
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
        const dest = User.imagePath + "/" + fileName;
        await fs.promises.writeFile(dest, req.file.buffer);
        user.useGoogleAvatar = false;
        user.avatar = dest;
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
