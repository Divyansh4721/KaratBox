const express = require("express");
const router = express.Router();
const passport = require("passport");
const printController = require("../controllers/print_controller");
const common_function = require("../controllers/common_function");

router.get(
  "/print/inventory",
  passport.checkAuthentication,
  printController.printInventory
);
router.post(
  "/print/estimate/retail",
  passport.checkAuthentication,
  printController.printEstimateRetail
);
router.post(
  "/print/estimate/wholesale",
  passport.checkAuthentication,
  printController.printEstimateWholesale
);

module.exports = router;
