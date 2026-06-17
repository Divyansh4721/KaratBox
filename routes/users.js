const express = require("express");
const router = express.Router();
const passport = require("passport");
const usersController = require("../controllers/users_controller");
router.get("/signin", usersController.signin);
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email"]
  })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/users/signin"
  }),
  usersController.checkuser
);
router.get("/signout", usersController.destroysession);
module.exports = router;
